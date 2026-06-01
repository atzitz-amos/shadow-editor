import {Logger, UseLogger} from "../../logging/Logger";
import {PersistedObject} from "../objects/PersistedObject";
import {Deserializer} from "../serializable/Deserializer";
import {Serialized} from "../serializable/Serializable";
import {Serializer} from "../serializable/Serializer";

/**
 *
 * @author Atzitz Amos
 * @date 12/29/2025
 * @since 1.0.0
 */
@UseLogger("Database")
export class Database {
    private declare readonly logger: Logger;

    private readonly db: string;
    private static readonly STORE_ENTRY_ID = "root";

    constructor(db: string) {
        this.db = db;
    }

    connect(version?: number): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.db, version);

            request.onerror = (event) => reject(request.error);
            request.onsuccess = (event) => resolve(request.result);
        })
    }

    async persist(obj: PersistedObject): Promise<void> {
        const storeName = obj.getPersistedKey();
        this.logger.debug("Persisting object to store: " + storeName);

        const db = await this.connect();

        if (!db.objectStoreNames.contains(storeName)) {
            this.logger.debug("Store not found, skipping persist: " + storeName);
            db.close();
            return;
        }

        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        const serialized = obj.persist(new Serializer());
        const data = JSON.stringify(serialized);
        const req = store.put({id: Database.STORE_ENTRY_ID, value: data});

        return new Promise((resolve, reject) => {
            req.onsuccess = () => {
                this.logger.debug("Persist complete for store: " + storeName);
                db.close();
                resolve();
            };
            transaction.onerror = () => {
                db.close();
                reject(transaction.error);
            };
        });
    }

    async upgrade(objects: PersistedObject[]) {
        this.logger.debug("Starting database upgrade...");

        const desiredStores = new Set(objects.map(obj => obj.getPersistedKey()));

        const db = await this.connect();

        const existingStores = new Set(Array.from(db.objectStoreNames));

        const storesToDelete = [...existingStores].filter(s => !desiredStores.has(s));
        const storesToCreate = [...desiredStores].filter(s => !existingStores.has(s));

        this.logger.debug("Upgrade analysis complete. Stores to delete: [" + storesToDelete.join(", ") + "]. Stores to create: [" + storesToCreate.join(", ") + "].");

        if (storesToDelete.length === 0 && storesToCreate.length === 0) {
            return await this.upgradeExistingStores(db, objects, db.objectStoreNames);
        }

        const newVersion = db.version + 1;
        db.close();

        return new Promise((resolve, reject) => {
            const upgradeRequest = indexedDB.open(this.db, newVersion);

            upgradeRequest.onupgradeneeded = (event) => {
                const upgradeDb = upgradeRequest.result;

                // Delete obsolete stores
                for (const name of storesToDelete) {
                    if (upgradeDb.objectStoreNames.contains(name)) {
                        upgradeDb.deleteObjectStore(name);
                    }
                }

                // Create missing stores
                for (const name of storesToCreate) {
                    if (!upgradeDb.objectStoreNames.contains(name)) {
                        upgradeDb.createObjectStore(name, {keyPath: 'id'});
                    }
                }
            };

            upgradeRequest.onsuccess = async () => {
                await this.upgradeExistingStores(upgradeRequest.result, objects, upgradeRequest.result.objectStoreNames);
                resolve(upgradeRequest.result);
            }
            upgradeRequest.onerror = () => reject(upgradeRequest.error);
        });
    }

    async recover(objects: PersistedObject[]) {
        this.logger.debug("Starting data recovery for " + objects.length + " objects...");

        const db = await this.connect();
        const storeNames = objects.map(obj => obj.getPersistedKey()).filter(name => db.objectStoreNames.contains(name));

        if (storeNames.length === 0) {
            this.logger.debug("No stores to recover");
            db.close();
            return;
        }

        const transaction = db.transaction(storeNames, 'readonly');

        for (const obj of objects) {
            const storeName = obj.getPersistedKey();
            if (!db.objectStoreNames.contains(storeName)) {
                this.logger.debug("Store not found, skipping: " + storeName);
                continue;
            }

            const data = await this.loadStoreData(transaction.objectStore(storeName));
            obj.load(new Deserializer(), data);
            this.logger.debug("Store " + storeName + " recovery done");
        }

        db.close();
        this.logger.debug("Data recovery complete");
    }

    async clearAll() {
        this.logger.debug("Clearing all data...");

        const db = await this.connect();
        const storeNames = Array.from(db.objectStoreNames);

        if (storeNames.length === 0) {
            this.logger.debug("No stores to clear");
            db.close();
            return;
        }

        const transaction = db.transaction(storeNames, 'readwrite');

        const clearPromises = storeNames.map(name => {
            return new Promise<void>((resolve, reject) => {
                const req = transaction.objectStore(name).clear();
                req.onsuccess = () => {
                    this.logger.debug("Cleared store: " + name);
                    resolve();
                };
                req.onerror = () => reject(req.error);
            });
        });

        await Promise.all(clearPromises);
        db.close();
        this.logger.debug("All data cleared");
    }

    private loadStoreData(store: IDBObjectStore): Promise<Serialized> {
        return new Promise((resolve, reject) => {
            const req = store.get(Database.STORE_ENTRY_ID);
            req.onerror = () => reject(req.error);
            req.onsuccess = () => {
                if (req.result?.value) {
                    resolve(JSON.parse(req.result.value));
                    return;
                }
                const fallbackReq = store.getAll();
                fallbackReq.onerror = () => reject(fallbackReq.error);
                fallbackReq.onsuccess = () => {
                    resolve(fallbackReq.result[0]?.value ? JSON.parse(fallbackReq.result[0].value) : null);
                };
            };
        });
    }

    private upgradeExistingStores(db: IDBDatabase, objects: PersistedObject[], storeNames: DOMStringList): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (storeNames.length === 0) {
                return resolve();
            }
            const transaction = db.transaction([...storeNames], 'readwrite');

            transaction.onerror = () => reject(transaction.error);
            transaction.oncomplete = () => resolve();
        });
    }
}
