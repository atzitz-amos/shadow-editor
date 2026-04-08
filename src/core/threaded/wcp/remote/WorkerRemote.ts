import {UUIDHelper} from "../../../../editor/utils/UUIDHelper";
import {WConnection} from "../connection/WConnection";
import {WCPInboundRequest} from "../connection/WCPInboundRequest";
import {WCPEndpoint} from "../model/WCPEndpoint";
import {WCPPort} from "../model/WCPPort";
import {WCPMessage, WCPRemoteState, WCPTransport, WorkerRemoteDebugInfo} from "../protocol/WCPTypes";

export type WCPEndpointHandler<TRequest, TResponse> =
    (request: WCPInboundRequest<TRequest, TResponse>) => Promise<TResponse | void> | TResponse | void;

interface PendingRequest {
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    timeoutHandle?: ReturnType<typeof setTimeout>;
}

interface RegisteredEndpoint {
    port: WCPPort;
    endpoint: WCPEndpoint<any, any>;
    handler: WCPEndpointHandler<any, any>;
}

export type WorkerRemoteCloseCallback = (remote: WorkerRemote, reason: string) => void;
export type WorkerRemoteRequestArrivedCallback = (remote: WorkerRemote, message: WCPMessage) => void;
export type WorkerRemoteRequestSucceededCallback = (remote: WorkerRemote, message: WCPMessage, delayMs: number) => void;
export type WorkerRemoteRequestFailedCallback = (remote: WorkerRemote, message: WCPMessage, error: any, delayMs: number) => void;

export class WorkerRemote {
    private static readonly DEFAULT_TIMEOUT_MS = 1000;

    private readonly remoteId: string = UUIDHelper.newUUID();
    private readonly createdAt = Date.now();

    private sentCount = 0;
    private receivedCount = 0;
    private state: WCPRemoteState = "created";

    private totalCompletedEndpointDelay = 0;
    private completedEndpointRequestCount = 0;

    private readonly pendingRequests = new Map<string, PendingRequest>();
    private readonly endpoints = new Map<string, RegisteredEndpoint>();

    private readonly onMessageBound: (event: MessageEvent) => void;
    private closeNotified = false;

    constructor(
        private readonly transport: WCPTransport,
        private readonly scriptPath: string,
        private readonly rawWorker: Worker | null,
        private readonly onClosed?: WorkerRemoteCloseCallback,
        private readonly onRequestArrived?: WorkerRemoteRequestArrivedCallback,
        private readonly onRequestSucceeded?: WorkerRemoteRequestSucceededCallback,
        private readonly onRequestFailed?: WorkerRemoteRequestFailedCallback
    ) {
        this.onMessageBound = this.onMessage.bind(this);
        this.transport.addEventListener("message", this.onMessageBound, true);
        this.state = "ready";
    }

    public getWorker(): Worker {
        if (!this.rawWorker) {
            throw new Error("No raw Worker is available on this remote.");
        }

        return this.rawWorker;
    }

    public getDebugInfo(): WorkerRemoteDebugInfo {
        return {
            remoteId: this.remoteId,
            scriptPath: this.scriptPath,
            createdAt: this.createdAt,
            sentCount: this.sentCount,
            receivedCount: this.receivedCount,
            pendingRequestCount: this.pendingRequests.size,
            registeredEndpointCount: this.endpoints.size,
            averageEndpointDelay: this.completedEndpointRequestCount > 0
                ? this.totalCompletedEndpointDelay / this.completedEndpointRequestCount
                : null,
            state: this.state
        };
    }

    public openPort(port: WCPPort, registrar: (registration: WCPPortRegistration) => void): WorkerRemote {
        registrar(new WCPPortRegistration(this, port));
        return this;
    }

    public openConnection(port: WCPPort): WConnection {
        return new WConnection(this, port);
    }

    public registerEndpoint<TRequest, TResponse>(
        port: WCPPort,
        endpoint: WCPEndpoint<TRequest, TResponse>,
        handler: WCPEndpointHandler<TRequest, TResponse>
    ): WorkerRemote {
        this.endpoints.set(this.endpointKey(port, endpoint.getName()), {port, endpoint, handler});
        return this;
    }

    public request<TRequest, TResponse>(
        port: WCPPort,
        endpoint: WCPEndpoint<TRequest, TResponse>,
        payload: TRequest,
        timeoutMs?: number
    ): Promise<TResponse> {
        this.assertReady();

        const requestId = UUIDHelper.newUUID();
        const resolvedTimeout = timeoutMs ?? WorkerRemote.DEFAULT_TIMEOUT_MS;

        const message: WCPMessage = {
            __wcp: true,
            kind: "request",
            requestId,
            portId: port.getId(),
            endpoint: endpoint.getName(),
            payload
        };

        this.sentCount++;
        this.transport.postMessage(message);

        return new Promise<TResponse>((resolve, reject) => {
            const pending: PendingRequest = {
                resolve,
                reject
            };

            if (resolvedTimeout > 0) {
                pending.timeoutHandle = globalThis.setTimeout(() => {
                    this.pendingRequests.delete(requestId);
                    reject(new Error(`WCP request timeout on ${port.getName()}.${endpoint.getName()}`));
                }, resolvedTimeout);
            }

            this.pendingRequests.set(requestId, pending);
        });
    }

    public publish<TRequest>(port: WCPPort, endpoint: WCPEndpoint<TRequest, any>, payload: TRequest): void {
        this.assertReady();

        const message: WCPMessage = {
            __wcp: true,
            kind: "publish",
            portId: port.getId(),
            endpoint: endpoint.getName(),
            payload
        };

        this.sentCount++;
        this.transport.postMessage(message);
    }

    public close(reason: string = "closed"): void {
        if (this.state === "closed") {
            this.notifyClose(reason);
            return;
        }

        this.state = "closed";
        this.transport.removeEventListener("message", this.onMessageBound, true);

        for (const [requestId, request] of this.pendingRequests) {
            if (request.timeoutHandle) {
                globalThis.clearTimeout(request.timeoutHandle);
            }

            request.reject(new Error(`WCP remote closed before response (${requestId}).`));
        }

        this.pendingRequests.clear();
        this.notifyClose(reason);
    }

    public terminate(reason: string = "terminated"): void {
        if (this.rawWorker) {
            this.rawWorker.terminate();
        }

        this.close(reason);
    }

    private onMessage(event: MessageEvent): void {
        const data = event.data as WCPMessage;
        if (!data || data.__wcp !== true) {
            return;
        }

        this.receivedCount++;

        if (data.kind === "response" || data.kind === "error") {
            this.resolvePending(data);
            return;
        }

        if (data.kind === "request" || data.kind === "publish") {
            this.routeIncoming(data);
        }
    }

    private resolvePending(message: WCPMessage): void {
        if (!message.requestId) {
            return;
        }

        const pending = this.pendingRequests.get(message.requestId);
        if (!pending) {
            return;
        }

        this.pendingRequests.delete(message.requestId);
        if (pending.timeoutHandle) {
            globalThis.clearTimeout(pending.timeoutHandle);
        }

        if (message.kind === "response") {
            pending.resolve(message.payload);
        } else {
            pending.reject(new Error(message.error ?? "Unknown WCP error"));
        }
    }

    private async routeIncoming(message: WCPMessage): Promise<void> {
        const startedAt = message.kind === "request" ? Date.now() : 0;
        if (message.kind === "request") {
            this.onRequestArrived?.(this, message);
        }

        const endpoint = this.endpoints.get(this.endpointKeyRaw(message.portId, message.endpoint));

        if (!endpoint) {
            if (message.kind === "request" && message.requestId) {
                this.sendError(message, `No endpoint registered for ${message.portId}.${message.endpoint}`);
            }

            if (message.kind === "request") {
                this.finishFailedRequest(message, startedAt, `No endpoint registered for ${message.portId}.${message.endpoint}`);
            }
            return;
        }

        const request = new WCPInboundRequest(
            message.payload,
            endpoint.port,
            endpoint.endpoint,
            {
                respond: payload => {
                    if (!message.requestId) {
                        return;
                    }
                    this.sendResponse(message, payload);
                },
                fail: error => {
                    if (!message.requestId) {
                        return;
                    }
                    this.sendError(message, error);
                }
            }
        );

        try {
            const output = await endpoint.handler(request);

            if (message.kind === "request" && message.requestId && !request.hasReplied()) {
                this.sendResponse(message, output);
            }

            if (message.kind === "request") {
                if (request.getOutcome() === "failed") {
                    this.finishFailedRequest(message, startedAt, "Request failed by handler");
                } else {
                    this.finishSucceededRequest(message, startedAt);
                }
            }
        } catch (error) {
            if (message.kind === "request" && message.requestId && !request.hasReplied()) {
                this.sendError(message, error);
            }

            if (message.kind === "request") {
                this.finishFailedRequest(message, startedAt, error);
            }
        }
    }

    private sendResponse(source: WCPMessage, payload: any): void {
        const reply: WCPMessage = {
            __wcp: true,
            kind: "response",
            requestId: source.requestId,
            portId: source.portId,
            endpoint: source.endpoint,
            payload
        };

        this.sentCount++;
        this.transport.postMessage(reply);
    }

    private sendError(source: WCPMessage, error: any): void {
        const reply: WCPMessage = {
            __wcp: true,
            kind: "error",
            requestId: source.requestId,
            portId: source.portId,
            endpoint: source.endpoint,
            error: error instanceof Error ? error.message : `${error}`
        };

        this.sentCount++;
        this.transport.postMessage(reply);
    }

    private endpointKey(port: WCPPort, endpointName: string): string {
        return `${port.getId()}::${endpointName}`;
    }

    private endpointKeyRaw(portId: string, endpointName: string): string {
        return `${portId}::${endpointName}`;
    }

    private assertReady(): void {
        if (this.state !== "ready") {
            throw new Error(`WorkerRemote is not ready (state=${this.state}).`);
        }
    }

    private finishSucceededRequest(message: WCPMessage, startedAt: number): void {
        const delay = Date.now() - startedAt;
        this.totalCompletedEndpointDelay += delay;
        this.completedEndpointRequestCount++;
        this.onRequestSucceeded?.(this, message, delay);
    }

    private finishFailedRequest(message: WCPMessage, startedAt: number, error: any): void {
        const delay = Date.now() - startedAt;
        this.totalCompletedEndpointDelay += delay;
        this.completedEndpointRequestCount++;
        this.onRequestFailed?.(this, message, error, delay);
    }

    private notifyClose(reason: string): void {
        if (this.closeNotified || !this.onClosed) {
            return;
        }

        this.closeNotified = true;
        this.onClosed(this, reason);
    }
}

export class WCPPortRegistration {
    constructor(
        private readonly remote: WorkerRemote,
        private readonly port: WCPPort
    ) {
    }

    public addEndpoint<TRequest, TResponse>(
        endpoint: WCPEndpoint<TRequest, TResponse>,
        handler: WCPEndpointHandler<TRequest, TResponse>
    ): WCPPortRegistration {
        this.remote.registerEndpoint(this.port, endpoint, handler);
        return this;
    }
}

