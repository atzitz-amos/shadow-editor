export type WCPMessageKind = "request" | "response" | "error" | "publish";

export interface WCPMessage {
    __wcp: true;
    kind: WCPMessageKind;
    requestId?: string;
    portId: string;
    endpoint: string;
    payload?: any;
    error?: string;
}

export type WCPRemoteState = "created" | "ready" | "closed";

export interface WorkerRemoteDebugInfo {
    readonly remoteId: string;
    readonly scriptPath: string;
    readonly createdAt: number;
    readonly sentCount: number;
    readonly receivedCount: number;
    readonly pendingRequestCount: number;
    readonly registeredEndpointCount: number;
    readonly averageEndpointDelay: number | null;
    readonly state: WCPRemoteState;
}

export interface WCPTransport {
    postMessage(message: any): void;

    addEventListener(type: "message", listener: (event: MessageEvent) => void, options?: boolean | AddEventListenerOptions): void;

    removeEventListener(type: "message", listener: (event: MessageEvent) => void, options?: boolean | EventListenerOptions): void;
}


export interface WCPBackgroundTask {
    remoteId: string;
    scriptPath: string;
    createdAt: number;
    sentCount: number;
    receivedCount: number;
    pendingRequestCount: number;
    averageEndpointDelay: number | null;
    activeRequests: number;
    totalRequests: number;
    succeededRequests: number;
    failedRequests: number;
    state: string;
}
