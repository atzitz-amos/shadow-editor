import {Logger, UseLogger} from "../logging/Logger";
import {PersistedObject} from "./objects/PersistedObject";
import {ValueCell} from "./objects/cell/ValueCell";
import {Database} from "./db/Database";
import {Serialized} from "./serializable/Serializable";
import {Deserializer} from "./serializable/Deserializer";
import {Serializer} from "./serializable/Serializer";
import {Cell} from "./objects/cell/Cell";
import {MapCell} from "./objects/cell/MapCell";
import {UnsafeFlagsService} from "../sync/flags/UnsafeFlagsService";
import {UnsafeFlags} from "../sync/flags/UnsafeFlags";
import {Scheduler} from "../scheduler/Scheduler";
import {PersistedOptions} from "./objects/cell/PersistedOptions";
import {ArrayCell} from "./objects/cell/ArrayCell";


type DB_SCHEME = {
    objects: {
        version: number,
        value: Serialized,
    }
}

/**
 *
 * @author Atzitz Amos
 * @date 11/17/2025
 * @since 1.0.0
 */
@UseLogger("PersistenceModel")
export class PersistenceModel {
    private static _instance: PersistenceModel;
    private declare readonly logger: Logger;

    private readonly db: Database<DB_SCHEME> = new Database("shadow.db", 1, ["objects"]);

    private readonly initializers: Cell[] = [];
    private wasInitialized: boolean = false;

    private readonly updateQueue: Set<Cell> = new Set<Cell>();

    public static getInstance(): PersistenceModel {
        if (!this._instance) {
            this._instance = new PersistenceModel();
        }
        return this._instance;
    }

    public async init(): Promise<void> {
        this.logger.info("Starting db recovery");

        await this.db.requestPersistence();

        await this.db.connect();
        await this.recover();

        this.wasInitialized = true;
    }

    public async persist(objects: PersistedObject[]): Promise<void> {
    }

    public createCell<T extends object>(key: string, defaultValue: T, options?: PersistedOptions) {
        const cell = new ValueCell(this, key, defaultValue, options);
        this.addInitializer(cell);
        return cell;
    }

    public createArrayCell(key: string, initialValue: Array<any>, options: PersistedOptions | undefined) {
        const cell = ArrayCell.create(this, key, initialValue, options);
        this.addInitializer(cell);
        return cell;
    }

    public createMapCell(key: string, defaultValue: Map<any, any>, options: PersistedOptions | undefined) {
        const cell = new MapCell(this, key, defaultValue, options);
        this.addInitializer(cell);
        return cell;
    }

    public persistCell(cell: Cell) {
        this.updateQueue.add(cell);

        this.schedule();
    }

    /**
     * Forces an immediate flush of any pending cell writes, bypassing the debounce.
     * Note: this flushes the *entire* pending update queue, not just cells belonging
     * to a single caller — that's intentional, since a forced-flush caller (e.g. a
     * beforeunload handler, or a class's triggerPersist()) usually wants everything
     * pending written out together as one batch.
     */
    public async flushNow(): Promise<void> {
        Scheduler.debounce(async () => await this.flush(), 1000);
    }

    private addInitializer(cell: Cell) {
        if (this.wasInitialized) {
            this.logger.warn("Adding a new persisted cell after initialization, this may cause unexpected results");
            setTimeout(async () => {
                cell.init(await this.retrieve(cell));
            })
        } else
            this.initializers.push(cell);
    }

    private async recover() {
        for (const cell of this.initializers) {
            cell.init(await this.retrieve(cell));
        }
    }

    private async retrieve(cell: Cell) {
        const store = this.db.getObjectStore("objects");
        const obj = await store.get(cell.getKey());
        if (!obj) return cell.getValue();

        const deserializer = new Deserializer();
        const deserializerFunc = cell.getOptions()?.deserializer;
        if (deserializerFunc) {
            deserializerFunc(deserializer);
        }

        let value = deserializer.deserializeObject(obj.value);

        let version = obj.version;
        let fromVersion = version;
        const targetVersion = cell.getVersion();
        const migrations = cell.getOptions()?.migrations;

        if (!migrations) return value;

        while (version < targetVersion) {
            if (migrations[version]) {
                value = migrations[version](value, fromVersion);
                fromVersion = version;
            }
            version++;
        }

        return value;
    }

    private schedule() {
        UnsafeFlagsService.flag(UnsafeFlags.PERSISTENCE);
        Scheduler.debounce(async () => await this.flush(), 1000);
    }

    private async flush() {
        if (!UnsafeFlagsService.clear(UnsafeFlags.PERSISTENCE)) return;
        if (!this.updateQueue.size) return;

        this.logger.debug(`Persisting cells: ` + this.updateQueue.values().map(x => x.getKey()).reduce((a, b) => a + ", " + b));

        for (const cell of this.updateQueue) {
            if (!this.wasInitialized) throw new Error("Attempted to persist a cell before its value was initialized");

            const serializer = new Serializer();
            const value = serializer.serializeObject(cell.getValue());

            const store = this.db.getObjectStore("objects");
            await store.set(cell.getKey(), {version: cell.getVersion(), value});
        }

        this.updateQueue.clear();
    }
}