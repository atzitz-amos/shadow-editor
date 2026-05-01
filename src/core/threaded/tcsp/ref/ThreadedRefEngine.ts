import {TRefRegistry} from "./TRefRegistry";
import {Service} from "../../service/Service";
import {GlobalState} from "../../../global/GlobalState";
import {WebWorkerCreatedEvent} from "../../events/WebWorkerCreatedEvent";
import {WCP} from "../../wcp/api/WCP";
import {WConnection} from "../../wcp/connection/WConnection";
import {WCPEndpoint} from "../../wcp/model/WCPEndpoint";
import {WCPPort} from "../../wcp/model/WCPPort";
import {WorkerRemote} from "../../wcp/remote/WorkerRemote";

/**
 *
 * @author Atzitz Amos
 * @date 4/3/2026
 * @since 1.0.0
 */
@Service
export class ThreadedRefEngine {
    private static readonly instance: ThreadedRefEngine = new ThreadedRefEngine();

    private static readonly PORT = WCPPort.forName("ThreadedRefEngine");

    private static readonly CREATE_REF_ENDPOINT =
        new WCPEndpoint<{ name: string }, { uuid: string }>("create_ref", 1000);
    private static readonly FREE_REF_ENDPOINT =
        new WCPEndpoint<{ uuid: string }, { ok: boolean }>("free_ref", 1000);
    private static readonly GET_PROP_ENDPOINT =
        new WCPEndpoint<{ callChain: string }, { value: any }>("get_prop", 1000);
    private static readonly INVOKE_ENDPOINT =
        new WCPEndpoint<{ callChain: string, forwardedArgs: any[] }, { uuid: string }>("invoke", 1000);
    private static readonly IS_DEFINED_ENDPOINT =
        new WCPEndpoint<{ uuid: string }, { defined: boolean }>("is_defined", 1000);

    private static workerConnection: WConnection | null = null;

    private readonly registry: TRefRegistry = new TRefRegistry();

    private static isCallbackMarker(value: any): value is { __is_cb: true, uuid: string } {
        return !!value && typeof value === "object" && value.__is_cb === true && typeof value.uuid === "string";
    }

    private static splitCallChain(callChain: string): [string, string] {
        const separator = callChain.indexOf(".");
        if (separator <= 0 || separator >= callChain.length - 1) {
            throw new Error("Invalid call chain: " + callChain);
        }

        return [callChain.substring(0, separator), callChain.substring(separator + 1)];
    }

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
        const response = await this.getWorkerConnection().send(ThreadedRefEngine.INVOKE_ENDPOINT, {
            callChain,
            forwardedArgs
        });
        return response.uuid;
    }

    public static async getProperty(callerUUID: string, prop: string | symbol): Promise<any> {
        const response = await this.getWorkerConnection().send(ThreadedRefEngine.GET_PROP_ENDPOINT, {
            callChain: ThreadedRefEngine.createCallChain(callerUUID, prop.toString())
        });

        return response.value;
    }

    public static async isDefined(uuid: string): Promise<boolean> {
        const response = await this.getWorkerConnection().send(ThreadedRefEngine.IS_DEFINED_ENDPOINT, {uuid});
        return response.defined;
    }

    public static async createRef(name: string): Promise<string> {
        const response = await this.getWorkerConnection().send(ThreadedRefEngine.CREATE_REF_ENDPOINT, {name});
        return response.uuid;
    }

    public static async freeRef(uuid: string): Promise<void> {
        await this.getWorkerConnection().send(ThreadedRefEngine.FREE_REF_ENDPOINT, {uuid});
    }

    public begin(): void {
        GlobalState.getMainEventBus().subscribe(this, WebWorkerCreatedEvent.SUBSCRIBER, ev => {
            this.setupRemote(ev.getRemote());
        });
    }

    private static getWorkerConnection(): WConnection {
        if (!this.workerConnection) {
            this.workerConnection = WCP.openConnection(this.PORT);
        }

        return this.workerConnection;
    }

    private readonly cbGcTracker = new FinalizationRegistry<{ worker: Worker, uuid: string }>(({worker, uuid}) => {
        worker.postMessage({type: "free_cb", uuid});
    });

    private setupRemote(remote: WorkerRemote): void {
        remote.openPort(ThreadedRefEngine.PORT, port => {
            port.addEndpoint(ThreadedRefEngine.FREE_REF_ENDPOINT, request => {
                this.registry.delete(request.getArg("uuid"));
                return {ok: true};
            });

            port.addEndpoint(ThreadedRefEngine.GET_PROP_ENDPOINT, request => {
                const callChain = request.getArg("callChain");
                const [root, propName] = ThreadedRefEngine.splitCallChain(callChain);
                const obj = this.registry.get(root);

                if (obj === undefined) {
                    throw new Error("No object found for call chain: " + callChain);
                }

                return {value: obj[propName]};
            });

            port.addEndpoint(ThreadedRefEngine.CREATE_REF_ENDPOINT, request => {
                return this.handleCreateRefRequest(request.getArg("name"));
            });

            port.addEndpoint(ThreadedRefEngine.INVOKE_ENDPOINT, request => {
                const {callChain, forwardedArgs} = request.getPayload();
                return this.handleInvocationRequest(callChain, forwardedArgs, remote.getWorker());
            });

            port.addEndpoint(ThreadedRefEngine.IS_DEFINED_ENDPOINT, request => {
                return {defined: this.registry.isDefined(request.getArg("uuid"))};
            });
        });
    }

    private deserializeInvocationArg(arg: any, worker: Worker): any {
        if (Array.isArray(arg)) {
            return arg.map(item => this.deserializeInvocationArg(item, worker));
        }

        if (ThreadedRefEngine.isCallbackMarker(arg)) {
            return this.createRemoteCallback(arg.uuid, worker);
        }

        return arg;
    }

    private serializeCallbackArg(arg: any): any {
        if (Array.isArray(arg)) {
            return arg.map(item => this.serializeCallbackArg(item));
        }

        if (arg !== null && typeof arg === "object") {
            return {__is_ref: true, uuid: this.registry.save(arg)};
        }

        return arg;
    }

    private createRemoteCallback(uuid: string, worker: Worker): (...cbArgs: any[]) => void {
        const callback = (...cbArgs: any[]) => {
            const safeArgs = cbArgs.map(cbArg => this.serializeCallbackArg(cbArg));

            // Keep callback dispatch compatible with existing RefUtils listener.
            worker.postMessage({type: "cb_invoke", uuid, args: safeArgs});
        };

        this.cbGcTracker.register(callback, {worker, uuid});
        return callback;
    }

    private async handleInvocationRequest(callChain: string, args: any[], worker: Worker): Promise<{ uuid: string }> {
        const [root, methodName] = ThreadedRefEngine.splitCallChain(callChain);

        const deserializedArgs = (args ?? []).map(arg => this.deserializeInvocationArg(arg, worker));

        const obj = this.registry.get(root);
        if (obj === undefined) {
            throw new Error("No method found for call chain: " + callChain);
        }

        let result = obj[methodName](...deserializedArgs);
        if (result instanceof Promise) {
            result = await result;
        }

        return {uuid: this.registry.save(result)};
    }

    private async handleCreateRefRequest(name: string): Promise<{ uuid: string }> {
        return {uuid: this.registry.getOrSave(name)};
    }
}

