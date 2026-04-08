import {Service} from "../service/Service";
import {GlobalState} from "../../global/GlobalState";
import {WebWorkerCreatedEvent} from "../events/WebWorkerCreatedEvent";
import {WebWorkerRequestArrivedEvent} from "../events/WebWorkerRequestArrivedEvent";
import {WebWorkerRequestFailedEvent} from "../events/WebWorkerRequestFailedEvent";
import {WebWorkerRequestSucceededEvent} from "../events/WebWorkerRequestSucceededEvent";
import {WebWorkerTerminateEvent} from "../events/WebWorkerTerminateEvent";
import {WorkerRemote} from "./remote/WorkerRemote";
import {WCPBackgroundTask, WorkerRemoteDebugInfo} from "./protocol/WCPTypes";

interface RequestStats {
    activeRequests: number;
    totalRequests: number;
    succeededRequests: number;
    failedRequests: number;
}

export type WCPTrackedRequestStatus = "ACTIVE" | "SUCCEEDED" | "FAILED";

export interface WCPTrackedRequest {
    key: string;
    remoteId: string;
    requestId?: string;
    portId: string;
    endpoint: string;
    arrivedAt: number;
    completedAt?: number;
    delayMs?: number;
    status: WCPTrackedRequestStatus;
    error?: string;
}

@Service
export class WCPService {
    private static instance: WCPService;

    private readonly runningRemotes = new Map<string, WorkerRemote>();
    private readonly requestStats = new Map<string, RequestStats>();
    private readonly requestsByRemote = new Map<string, Map<string, WCPTrackedRequest>>();
    private requestAutoId = 0;

    public static getInstance(): WCPService {
        if (!this.instance) {
            this.instance = new WCPService();
        }

        return this.instance;
    }

    public begin(): void {
        const bus = GlobalState.getMainEventBus();

        bus.subscribe(this, WebWorkerCreatedEvent.SUBSCRIBER, ev => {
            const remote = ev.getRemote();
            const remoteId = remote.getDebugInfo().remoteId;
            this.runningRemotes.set(remoteId, remote);
            this.requestStats.set(remoteId, {
                activeRequests: 0,
                totalRequests: 0,
                succeededRequests: 0,
                failedRequests: 0
            });
            this.requestsByRemote.set(remoteId, new Map());
        });

        bus.subscribe(this, WebWorkerRequestArrivedEvent.SUBSCRIBER, ev => {
            const remoteId = ev.getRemote().getDebugInfo().remoteId;
            const stats = this.getOrCreateStats(remoteId);
            const reqMap = this.getOrCreateRequestMap(remoteId);
            const key = this.toRequestKey(remoteId, ev.getRequestId());

            stats.totalRequests++;
            stats.activeRequests++;

            reqMap.set(key, {
                key,
                remoteId,
                requestId: ev.getRequestId(),
                portId: ev.getPortId(),
                endpoint: ev.getEndpoint(),
                arrivedAt: Date.now(),
                status: "ACTIVE"
            });
        });

        bus.subscribe(this, WebWorkerRequestSucceededEvent.SUBSCRIBER, ev => {
            const remoteId = ev.getRemote().getDebugInfo().remoteId;
            const stats = this.getOrCreateStats(remoteId);
            const reqMap = this.getOrCreateRequestMap(remoteId);
            const key = this.toRequestKey(remoteId, ev.getRequestId());

            stats.succeededRequests++;
            stats.activeRequests = Math.max(0, stats.activeRequests - 1);

            const existing = reqMap.get(key);
            const now = Date.now();
            reqMap.set(key, {
                key,
                remoteId,
                requestId: ev.getRequestId(),
                portId: ev.getPortId(),
                endpoint: ev.getEndpoint(),
                arrivedAt: existing?.arrivedAt ?? (now - ev.getDelayMs()),
                completedAt: now,
                delayMs: ev.getDelayMs(),
                status: "SUCCEEDED"
            });
        });

        bus.subscribe(this, WebWorkerRequestFailedEvent.SUBSCRIBER, ev => {
            const remoteId = ev.getRemote().getDebugInfo().remoteId;
            const stats = this.getOrCreateStats(remoteId);
            const reqMap = this.getOrCreateRequestMap(remoteId);
            const key = this.toRequestKey(remoteId, ev.getRequestId());

            stats.failedRequests++;
            stats.activeRequests = Math.max(0, stats.activeRequests - 1);

            const existing = reqMap.get(key);
            const now = Date.now();
            reqMap.set(key, {
                key,
                remoteId,
                requestId: ev.getRequestId(),
                portId: ev.getPortId(),
                endpoint: ev.getEndpoint(),
                arrivedAt: existing?.arrivedAt ?? (now - ev.getDelayMs()),
                completedAt: now,
                delayMs: ev.getDelayMs(),
                status: "FAILED",
                error: ev.getError()
            });
        });

        bus.subscribe(this, WebWorkerTerminateEvent.SUBSCRIBER, ev => {
            const remoteId = ev.getRemote().getDebugInfo().remoteId;
            this.runningRemotes.delete(remoteId);
            this.requestStats.delete(remoteId);
            this.requestsByRemote.delete(remoteId);
        });
    }

    public getRunningRemotes(): WorkerRemote[] {
        return [...this.runningRemotes.values()];
    }

    public getBackgroundTasks(): WCPBackgroundTask[] {
        const tasks = this.getRunningRemotes().map(remote => this.toTask(remote.getDebugInfo()));
        tasks.sort((a, b) => a.createdAt - b.createdAt);
        return tasks;
    }

    public getTaskCount(): number {
        return this.runningRemotes.size;
    }

    public getRequests(remoteId?: string): WCPTrackedRequest[] {
        if (remoteId) {
            return this.getRequestsForRemote(remoteId);
        }

        const all: WCPTrackedRequest[] = [];
        for (const requests of this.requestsByRemote.values()) {
            all.push(...requests.values());
        }

        all.sort((a, b) => b.arrivedAt - a.arrivedAt);
        return all;
    }

    public getRequestsForRemote(remoteId: string): WCPTrackedRequest[] {
        const requests = [...this.getOrCreateRequestMap(remoteId).values()];
        requests.sort((a, b) => b.arrivedAt - a.arrivedAt);
        return requests;
    }

    public getActiveRequests(remoteId?: string): WCPTrackedRequest[] {
        return this.getRequests(remoteId).filter(r => r.status === "ACTIVE");
    }

    private toTask(info: WorkerRemoteDebugInfo): WCPBackgroundTask {
        const stats = this.getOrCreateStats(info.remoteId);

        return {
            remoteId: info.remoteId,
            scriptPath: info.scriptPath,
            createdAt: info.createdAt,
            sentCount: info.sentCount,
            receivedCount: info.receivedCount,
            pendingRequestCount: info.pendingRequestCount,
            averageEndpointDelay: info.averageEndpointDelay,
            activeRequests: stats.activeRequests,
            totalRequests: stats.totalRequests,
            succeededRequests: stats.succeededRequests,
            failedRequests: stats.failedRequests,
            state: info.state
        };
    }

    private getOrCreateStats(remoteId: string): RequestStats {
        let stats = this.requestStats.get(remoteId);
        if (stats) {
            return stats;
        }

        stats = {
            activeRequests: 0,
            totalRequests: 0,
            succeededRequests: 0,
            failedRequests: 0
        };
        this.requestStats.set(remoteId, stats);
        return stats;
    }

    private getOrCreateRequestMap(remoteId: string): Map<string, WCPTrackedRequest> {
        let reqMap = this.requestsByRemote.get(remoteId);
        if (reqMap) {
            return reqMap;
        }

        reqMap = new Map<string, WCPTrackedRequest>();
        this.requestsByRemote.set(remoteId, reqMap);
        return reqMap;
    }

    private toRequestKey(remoteId: string, requestId?: string): string {
        if (requestId) {
            return `${remoteId}:${requestId}`;
        }

        this.requestAutoId++;
        return `${remoteId}:unknown:${this.requestAutoId}`;
    }
}
