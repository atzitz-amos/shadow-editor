import {Launchable} from "../../Launchable";
import {ThreadedUtils} from "../../ThreadedUtils";
import {GlobalState} from "../../../global/GlobalState";
import {WebWorkerCreatedEvent} from "../../events/WebWorkerCreatedEvent";
import {WebWorkerRequestArrivedEvent} from "../../events/WebWorkerRequestArrivedEvent";
import {WebWorkerRequestFailedEvent} from "../../events/WebWorkerRequestFailedEvent";
import {WebWorkerRequestSucceededEvent} from "../../events/WebWorkerRequestSucceededEvent";
import {WebWorkerTerminateEvent} from "../../events/WebWorkerTerminateEvent";
import {WConnection} from "../connection/WConnection";
import {WCPPort} from "../model/WCPPort";
import {WorkerRemote} from "../remote/WorkerRemote";
import {WCPTransport} from "../protocol/WCPTypes";

export class WCP {
    private static workerSideRemote: WorkerRemote | null = null;

    public static createWorker(launchable: Launchable): WorkerRemote {
        ThreadedUtils.assertMainThread();

        const worker = new Worker(launchable.getWorkerScriptPath(), {type: "module"});
        const remote = new WorkerRemote(
            worker,
            launchable.getWorkerScriptPath(),
            worker,
            (closedRemote, reason) => {
                GlobalState.getMainEventBus().syncPublish(new WebWorkerTerminateEvent(closedRemote, reason));
            },
            (requestRemote, message) => {
                const requestId = message.requestId ?? "unknown";
                GlobalState.getMainEventBus().syncPublish(
                    new WebWorkerRequestArrivedEvent(requestRemote, requestId, message.portId, message.endpoint)
                );
            },
            (requestRemote, message, delayMs) => {
                const requestId = message.requestId ?? "unknown";
                GlobalState.getMainEventBus().syncPublish(
                    new WebWorkerRequestSucceededEvent(requestRemote, requestId, message.portId, message.endpoint, delayMs)
                );
            },
            (requestRemote, message, error, delayMs) => {
                const requestId = message.requestId ?? "unknown";
                GlobalState.getMainEventBus().syncPublish(
                    new WebWorkerRequestFailedEvent(
                        requestRemote,
                        requestId,
                        message.portId,
                        message.endpoint,
                        delayMs,
                        error instanceof Error ? error.message : `${error}`
                    )
                );
            }
        );

        const nativeTerminate = worker.terminate.bind(worker);
        worker.terminate = () => {
            nativeTerminate();
            remote.close("terminated");
        };

        worker.addEventListener("error", () => {
            remote.close("error");
        }, true);

        worker.postMessage({type: "init"});

        GlobalState.getMainEventBus().syncPublish(new WebWorkerCreatedEvent(remote));

        return remote;
    }

    public static openConnection(port: WCPPort): WConnection {
        ThreadedUtils.assertWorkerThread();

        if (!this.workerSideRemote) {
            const transport = self as unknown as WCPTransport;
            this.workerSideRemote = new WorkerRemote(transport, "worker:self", null);
        }

        return this.workerSideRemote.openConnection(port);
    }
}

