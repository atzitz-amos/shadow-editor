import {WCPPort} from "../model/WCPPort";
import {WCPEndpoint} from "../model/WCPEndpoint";
import {WorkerRemote} from "../remote/WorkerRemote";

export class WConnection {
    constructor(
        private readonly remote: WorkerRemote,
        private readonly port: WCPPort
    ) {
    }

    public getPort(): WCPPort {
        return this.port;
    }

    public endpoint<TRequest, TResponse>(endpoint: WCPEndpoint<TRequest, TResponse>): WRemoteEndpoint<TRequest, TResponse> {
        return new WRemoteEndpoint<TRequest, TResponse>(this, endpoint);
    }

    public send<TRequest, TResponse>(
        endpoint: WCPEndpoint<TRequest, TResponse>,
        payload: TRequest,
        timeoutMs?: number
    ): Promise<TResponse> {
        const effectiveTimeout = timeoutMs ?? endpoint.getDefaultTimeoutMs();
        return this.remote.request(this.port, endpoint, payload, effectiveTimeout);
    }

    public publish<TRequest>(endpoint: WCPEndpoint<TRequest, any>, payload: TRequest): void {
        this.remote.publish(this.port, endpoint, payload);
    }
}

export class WRemoteEndpoint<TRequest, TResponse> {
    constructor(
        private readonly connection: WConnection,
        private readonly endpoint: WCPEndpoint<TRequest, TResponse>
    ) {
    }

    public send(payload: TRequest, timeoutMs?: number): Promise<TResponse> {
        return this.connection.send(this.endpoint, payload, timeoutMs);
    }

    public publish(payload: TRequest): void {
        this.connection.publish(this.endpoint, payload);
    }
}

