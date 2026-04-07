import {ThreadedUtils} from "../ThreadedUtils";
import {UUIDHelper} from "../../../editor/utils/UUIDHelper";
import {Launchable} from "../Launchable";
import {GlobalState} from "../../global/GlobalState";
import {WebWorkerCreatedEvent} from "../events/WebWorkerCreatedEvent";

/**
 * Listen to incoming messages from WebWorkers and route them to the appropriate services.
 *
 * @author Atzitz Amos
 * @date 4/3/2026
 * @since 1.0.0
 */
export class TCSP {
    static request(data: Record<any, any>, maxTimeout?: number): Promise<any> {
        ThreadedUtils.assertWorkerThread();

        const request = {};
        const uuid = UUIDHelper.newUUID();

        request["__req_id"] = uuid;
        request["type"] = "request"
        request["payload"] = data;
        self.postMessage(request);

        return new Promise<any>((resolve, reject) => {
            function listener(event: MessageEvent) {
                if (event.data["type"] == "answer" && event.data["__req_id"] === uuid) {
                    if (cancelTimeout) self.clearTimeout(cancelTimeout);
                    self.removeEventListener("message", listener);
                    resolve(event.data["result"] ?? {});
                } else if (event.data["type"] == "failure" && event.data["__req_id"] === uuid) {
                    if (cancelTimeout) self.clearTimeout(cancelTimeout);
                    self.removeEventListener("message", listener);
                    reject(event.data["error"] ?? "Unknown error");
                }
            }

            let cancelTimeout: any = undefined;
            if (maxTimeout) cancelTimeout = self.setTimeout(() => {
                self.removeEventListener("message", listener);
                reject("Request timeout");
            }, maxTimeout)

            self.addEventListener("message", listener);
        });
    }

    static createWorker(launchable: Launchable) {
        ThreadedUtils.assertMainThread();

        const worker = new Worker(launchable.getWorkerScriptPath(), {type: "module"});
        worker.postMessage({"type": "init"});

        GlobalState.getMainEventBus().syncPublish(new WebWorkerCreatedEvent(worker));

        return worker;
    }
}
