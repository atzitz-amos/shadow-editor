import {WCPPort} from "../model/WCPPort";
import {WCPEndpoint} from "../model/WCPEndpoint";
import {WCPEndpointHandler, WorkerRemote} from "../remote/WorkerRemote";

export class WConnection {
    constructor(
        private readonly remote: WorkerRemote,
        private readonly port: WCPPort
    ) {
    }

    public getPort(): WCPPort {
        return this.port;
    }

    public getRemote(): WorkerRemote {
        return this.remote;
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

    public registerEndpoint<TRequest, TResponse>(
        endpoint: WCPEndpoint<TRequest, TResponse>,
        handler: WCPEndpointHandler<TRequest, TResponse>
    ): WConnection {
        this.remote.registerEndpoint(this.port, endpoint, handler);
        return this;
    }
}