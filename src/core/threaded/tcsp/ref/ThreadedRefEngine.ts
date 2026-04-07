import {TCSP} from "../TCSP";
import {TRefRegistry} from "./TRefRegistry";
import {Service} from "../../service/Service";
import {GlobalState} from "../../../global/GlobalState";
import {WebWorkerCreatedEvent} from "../../events/WebWorkerCreatedEvent";

/**
 *
 * @author Atzitz Amos
 * @date 4/3/2026
 * @since 1.0.0
 */
@Service
export class ThreadedRefEngine {
    private static readonly instance: ThreadedRefEngine = new ThreadedRefEngine();

    private registry: TRefRegistry = new TRefRegistry();

    public static getInstance(): ThreadedRefEngine {
        return ThreadedRefEngine.instance;
    }

    public static async invokeMethod(callerUUID: string, callee: string, forwardedArgs: any[]): Promise<string> {
        return ThreadedRefEngine.invokeCallChain(ThreadedRefEngine.createCallChain(callerUUID, callee), forwardedArgs);
    }

    public static createCallChain(parentUUID: string, method: string): string {
        return parentUUID + "." + method;
    }

    public static async invokeCallChain(callChain: string, forwardedArgs: any[]): Promise<string> {
        return (await TCSP.request({
            callChain,
            forwardedArgs
        }, 1000)).uuid;
    }

    public static async getProperty(callerUUID: string, prop: string | symbol): Promise<any> {
        return (await TCSP.request({
            type: "get_prop",
            callChain: ThreadedRefEngine.createCallChain(callerUUID, prop.toString())
        }, 1000)).value;
    }

    static async createRef(name: string) {
        return (await TCSP.request({
            name
        }, 1000)).uuid;
    }

    static async freeRef(uuid: string) {
        await TCSP.request({
            type: "free_ref",
            uuid
        }, 1000);
    }

    begin() {
        GlobalState.getMainEventBus().subscribe(this, WebWorkerCreatedEvent.SUBSCRIBER, ev => {
            this.setupWorker(ev.getWorker());
        });
    }

    private cbGcTracker = new FinalizationRegistry<{worker: Worker, uuid: string}>(({worker, uuid}) => {
        worker.postMessage({ type: "free_cb", uuid });
    });

    private setupWorker(worker: Worker) {
        worker.addEventListener("message", async (event) => {
            const payload = event.data.payload || {};
            const callChain = payload["callChain"];
            const args = payload["forwardedArgs"];
            const reqId = event.data["__req_id"] ?? 0;

            if (payload.type === "free_ref" && payload.uuid) {
                this.registry.delete(payload.uuid);
                return worker.postMessage({"type": "answer", "__req_id": reqId, "result": "ok"});
            }

            if (payload.type === "get_prop" && callChain) {
                try {
                    const [root, propName] = callChain.split(".");
                    const obj = this.registry.get(root);
                    if (obj === undefined) {
                        throw new Error("No object found for call chain: " + callChain);
                    }
                    return worker.postMessage({
                        "type": "answer",
                        "__req_id": reqId,
                        "result": { value: obj[propName] }
                    });
                } catch (e) {
                    return worker.postMessage({
                        "type": "failure",
                        "__req_id": reqId,
                        "error": e instanceof Error ? e.message : e
                    });
                }
            }

            if (!callChain && payload["name"]) {
                try {
                    return worker.postMessage({
                        "type": "answer",
                        "__req_id": reqId,
                        "result": await this.handleCreateRefRequest(payload["name"])
                    });
                } catch (e) {
                    return worker.postMessage({
                        "type": "failure",
                        "__req_id": reqId,
                        "error": e instanceof Error ? e.message : e
                    })
                }
            }

            try {
                var result = await this.handleInvocationRequest(callChain, args, worker);
            } catch (e) {
                return worker.postMessage({
                    "type": "failure",
                    "__req_id": reqId,
                    "error": e instanceof Error ? e.message : e
                });
            }

            worker.postMessage({"type": "answer", "__req_id": reqId, "result": result})
        }, true);
    }

    private async handleInvocationRequest(callChain: string, args: any[], worker: Worker): Promise<any> {
        const [root, methodName] = callChain.split(".");

        const deserializedArgs = (args ?? []).map(arg => {
            if (arg && typeof arg === "object" && arg.__is_cb) {
                const cb = (...cbArgs: any[]) => {
                    const safeArgs = cbArgs.map(cbArg => {
                        if (cbArg !== null && typeof cbArg === "object") {
                            return {__is_ref: true, uuid: this.registry.save(cbArg)};
                        }
                        return cbArg;
                    });
                    worker.postMessage({type: "cb_invoke", uuid: arg.uuid, args: safeArgs});
                };
                this.cbGcTracker.register(cb, { worker, uuid: arg.uuid });
                return cb;
            }
            return arg;
        });

        const obj = this.registry.get(root);
        if (obj === undefined) {
            throw new Error("No method found for call chain: " + callChain);
        }
        let result = obj[methodName](...deserializedArgs);
        if (result instanceof Promise) {
            result = await result;
        }

        return {
            uuid: this.registry.save(result)
        };
    }

    private async handleCreateRefRequest(name: string) {
        return {
            uuid: this.registry.getOrSave(name)
        }
    }
}
