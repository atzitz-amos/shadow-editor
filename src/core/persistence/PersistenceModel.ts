import {PersistenceStrategy} from "./PersistenceStrategy";
import {Database} from "./db/Database";
import {Logger, UseLogger} from "../logging/Logger";
import {PersistedObject} from "./objects/PersistedObject";

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
    private db: Database = new Database("app_db");

    public static getInstance(): PersistenceModel {
        if (!this._instance) {
            this._instance = new PersistenceModel();
        }
        return this._instance;
    }

    public async recover(strategy: PersistenceStrategy, objects: PersistedObject[]): Promise<void> {
        this.logger.info("Starting recovery with strategy: " + PersistenceStrategy[strategy]);

        await this.db.upgrade(objects);

        switch (strategy) {
            case PersistenceStrategy.PERSIST:
                await this.db.recover(objects);
                break;
            case PersistenceStrategy.CLEAR:
                await this.db.clearAll();
                break;
        }
    }

    public async persist(objects: PersistedObject[]): Promise<void> {
        for (const obj of objects) await this.db.persist(obj);
    }
}
