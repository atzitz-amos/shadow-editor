import {TRefRegistry} from "./TRefRegistry";
import {Service} from "../../service/Service";
import {GlobalState} from "../../../global/GlobalState";
import {WebWorkerCreatedEvent} from "../../events/WebWorkerCreatedEvent";
import {WCP} from "../../wcp/api/WCP";
import {WConnection} from "../../wcp/connection/WConnection";
import {WCPEndpoint} from "../../wcp/model/WCPEndpoint";
import {WCPPort} from "../../wcp/model/WCPPort";
import {WorkerRemote} from "../../wcp/remote/WorkerRemote";
import {isCallbackMarker, isPrimitive, isRefMarker, Wire} from "./RefProtocol";

/**
 * Main-thread side serves the registry; worker side talks to it through the static methods.
 *
 * @author Atzitz Amos
 * @date 4/3/2026
 * @since 1.0.0
 */
@Service
export class ThreadedRefEngine {
    private static readonly PORT = WCPPort.forName("ThreadedRefEngine");
    private static readonly TIMEOUT = 1000;

    private static readonly CREATE_REF =
        new WCPEndpoint<{ name: string }, { uuid: string }>("create_ref", ThreadedRefEngine.TIMEOUT);
    private static readonly FREE_REF =
        new WCPEndpoint<{ uuid: string }, { ok: boolean }>("free_ref", ThreadedRefEngine.TIMEOUT);
    private static readonly IS_DEFINED =
        new WCPEndpoint<{ uuid: string }, { defined: boolean }>("is_defined", ThreadedRefEngine.TIMEOUT);
    private static readonly GET_PROP =
        new WCPEndpoint<{ uuid: string, prop: string }, { result: Wire }>("get_prop", ThreadedRefEngine.TIMEOUT);
    private static readonly INVOKE =
        new WCPEndpoint<{ uuid: string, method: string, args: any[] }, {
            result: Wire
        }>("invoke", ThreadedRefEngine.TIMEOUT);
    private static readonly GET_VALUE =
        new WCPEndpoint<{ uuid: string }, { value: any }>("get_value", ThreadedRefEngine.TIMEOUT);

    private static readonly GET_ITEMS =
        new WCPEndpoint<{ uuid: string, start?: number, end?: number }, {
            items: Wire[]
        }>("get_items", ThreadedRefEngine.TIMEOUT);

    private static workerConnection: WConnection | null = null;

    private static readonly instance = new ThreadedRefEngine();

    private readonly registry = new TRefRegistry();

    private readonly cbGcTracker = new FinalizationRegistry<{ worker: Worker, uuid: string }>(({worker, uuid}) => {
        worker.postMessage({type: "free_cb", uuid});
    });

    public static getInstance(): ThreadedRefEngine {
        return ThreadedRefEngine.instance;
    }

    // ------------------------------------------------------------------ client side (worker)

    public static async invokeMethod(uuid: string, method: string, args: any[]): Promise<Wire> {
        const {result} = await ThreadedRefEngine.connection().send(ThreadedRefEngine.INVOKE, {uuid, method, args});
        return result;
    }

    public static async getProperty(uuid: string, prop: string): Promise<Wire> {
        const {result} = await ThreadedRefEngine.connection().send(ThreadedRefEngine.GET_PROP, {uuid, prop});
        return result;
    }

    /** Structured-clones the referenced object itself. Only works for cloneable values. */
    public static async getValue(uuid: string): Promise<any> {
        const {value} = await ThreadedRefEngine.connection().send(ThreadedRefEngine.GET_VALUE, {uuid});
        return value;
    }

    /** Fetches the elements of an array / iterable in one round trip (primitives by value, objects as refs). */
    public static async getItems(uuid: string, start?: number, end?: number): Promise<Wire[]> {
        const {items} = await ThreadedRefEngine.connection().send(ThreadedRefEngine.GET_ITEMS, {uuid, start, end});
        return items;
    }

    public static async isDefined(uuid: string): Promise<boolean> {
        const {defined} = await ThreadedRefEngine.connection().send(ThreadedRefEngine.IS_DEFINED, {uuid});
        return defined;
    }

    public static async createRef(name: string): Promise<string> {
        const {uuid} = await ThreadedRefEngine.connection().send(ThreadedRefEngine.CREATE_REF, {name});
        return uuid;
    }

    public static async freeRef(uuid: string): Promise<void> {
        await ThreadedRefEngine.connection().send(ThreadedRefEngine.FREE_REF, {uuid});
    }

    private static connection(): WConnection {
        return (ThreadedRefEngine.workerConnection ??= WCP.openConnection(ThreadedRefEngine.PORT));
    }

    // ------------------------------------------------------------------ server side (main thread)

    public begin(): void {
        GlobalState.getMainEventBus().subscribe(this, WebWorkerCreatedEvent.SUBSCRIBER, ev => {
            this.setupRemote(ev.getRemote());
        });
    }

    private setupRemote(remote: WorkerRemote): void {
        remote.openPort(ThreadedRefEngine.PORT, port => {
            port.addEndpoint(ThreadedRefEngine.CREATE_REF, req => ({uuid: this.registry.getOrSave(req.getArg("name"))}));

            port.addEndpoint(ThreadedRefEngine.FREE_REF, req => {
                this.registry.delete(req.getArg("uuid"));
                return {ok: true};
            });

            port.addEndpoint(ThreadedRefEngine.IS_DEFINED, req => ({defined: this.registry.isDefined(req.getArg("uuid"))}));

            port.addEndpoint(ThreadedRefEngine.GET_PROP, req => {
                const {uuid, prop} = req.getPayload();
                return {result: this.encode(this.resolve(uuid)[prop])};
            });

            port.addEndpoint(ThreadedRefEngine.GET_VALUE, req => ({value: this.resolve(req.getArg("uuid"))}));

            port.addEndpoint(ThreadedRefEngine.GET_ITEMS, req => {
                const {uuid, start, end} = req.getPayload();
                const target = this.resolve(uuid);

                if (typeof target[Symbol.iterator] !== "function") {
                    throw new Error(`"${uuid}" is not iterable`);
                }

                // slice before encoding so only the requested elements get registered
                const items: unknown[] = Array.isArray(target) ? target : Array.from(target);
                return {items: items.slice(start, end).map(item => this.encode(item))};
            });

            port.addEndpoint(ThreadedRefEngine.INVOKE, async req => {
                const {uuid, method, args} = req.getPayload();
                return this.handleInvoke(uuid, method, args ?? [], remote.getWorker());
            });
        });
    }

    private resolve(uuid: string): any {
        const obj = this.registry.get(uuid);
        if (obj === undefined || obj === null) {
            throw new Error(`No object registered for "${uuid}"`);
        }
        return obj;
    }

    private async handleInvoke(uuid: string, method: string, args: any[], worker: Worker): Promise<{ result: Wire }> {
        const target = this.resolve(uuid);
        const fn = target[method];
        if (typeof fn !== "function") {
            throw new Error(`"${method}" is not a function on "${uuid}"`);
        }

        // `await` is a no-op for non-promises
        const result = await fn.apply(target, args.map(arg => this.decodeArg(arg, worker)));
        return {result: this.encode(result)};
    }

    /** Primitives go by value, everything else is stored and sent as a reference. */
    private encode(value: unknown): Wire {
        return isPrimitive(value) ? value : {__is_ref: true, uuid: this.registry.save(value)};
    }

    private decodeArg(arg: any, worker: Worker): any {
        if (Array.isArray(arg)) return arg.map(item => this.decodeArg(item, worker));
        if (isCallbackMarker(arg)) return this.createRemoteCallback(arg.uuid, worker);
        if (isRefMarker(arg)) return this.resolve(arg.uuid);
        return arg;
    }

    private encodeCallbackArg(arg: any): any {
        return Array.isArray(arg) ? arg.map(item => this.encodeCallbackArg(item)) : this.encode(arg);
    }

    private createRemoteCallback(uuid: string, worker: Worker): (...cbArgs: any[]) => void {
        const callback = (...cbArgs: any[]) => {
            worker.postMessage({type: "cb_invoke", uuid, args: cbArgs.map(a => this.encodeCallbackArg(a))});
        };

        this.cbGcTracker.register(callback, {worker, uuid});
        return callback;
    }
}