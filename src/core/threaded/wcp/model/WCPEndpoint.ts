import {WConnection} from "../connection/WConnection";
import {WCPEndpointHandler} from "../remote/WorkerRemote";

export class WCPEndpoint<TRequest, TResponse> {
    constructor(
        private readonly name: string,
        private readonly defaultTimeoutMs?: number
    ) {
        if (!name || !name.trim()) {
            throw new Error("WCPEndpoint name must not be empty.");
        }
    }

    public getName(): string {
        return this.name;
    }

    public getDefaultTimeoutMs(): number | undefined {
        return this.defaultTimeoutMs;
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

    public handle(handler: WCPEndpointHandler<TRequest, TResponse>): WRemoteEndpoint<TRequest, TResponse> {
        this.connection.registerEndpoint(this.endpoint, handler);
        return this;
    }
}

