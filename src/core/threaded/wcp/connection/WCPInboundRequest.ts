import {WCPPort} from "../model/WCPPort";
import {WCPEndpoint} from "../model/WCPEndpoint";

export type WCPInboundRequestOutcome = "responded" | "failed" | null;

export class WCPInboundRequest<TRequest, TResponse> {
    private replied = false;
    private outcome: WCPInboundRequestOutcome = null;

    constructor(
        private readonly payload: TRequest,
        private readonly port: WCPPort,
        private readonly endpoint: WCPEndpoint<TRequest, TResponse>,
        private readonly responseCallbacks: {
            respond: (payload: TResponse) => void;
            fail: (error: any) => void;
        }
    ) {
    }

    public getPort(): WCPPort {
        return this.port;
    }

    public getEndpoint(): WCPEndpoint<TRequest, TResponse> {
        return this.endpoint;
    }

    public getPayload(): TRequest {
        return this.payload;
    }

    public getArg<K extends keyof TRequest>(key: K): TRequest[K] {
        return this.payload[key];
    }

    public hasReplied(): boolean {
        return this.replied;
    }

    public getOutcome(): WCPInboundRequestOutcome {
        return this.outcome;
    }

    public async respond(payload: TResponse): Promise<void> {
        if (this.replied) {
            return;
        }

        this.replied = true;
        this.outcome = "responded";
        this.responseCallbacks.respond(payload);
    }

    public async fail(error: any): Promise<void> {
        if (this.replied) {
            return;
        }

        this.replied = true;
        this.outcome = "failed";
        this.responseCallbacks.fail(error);
    }
}

