import {PersistedObject} from "../transaction/PersistedObject";
import {Logger, UseLogger} from "../../logging/Logger";
import {PersistedData} from "../transaction/PersistedData";
import {Updater} from "../transaction/Updater";

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

    async persist(obj: PersistedObject<any>): Promise<void> {
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
        const updater = new Updater(store);

        obj.persist(updater);
        await updater.flush();

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => {
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

    async upgrade(objects: PersistedObject<any>[]) {
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

    async recover(objects: PersistedObject<any>[]) {
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
            obj.load(data);
            this.logger.debug("Recovered " + data.size + " items from store: " + storeName);
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

    private loadStoreData<T>(store: IDBObjectStore): Promise<PersistedData<T>> {
        return new Promise((resolve, reject) => {
            const req = store.getAll();
            req.onerror = () => reject(req.error);
            req.onsuccess = () => {
                const data = new Map<string, T>();
                for (const item of req.result) {
                    if (item && item.id !== undefined) {
                        // Unwrap value if it was stored via set() method
                        const value = 'value' in item ? item.value : item;
                        data.set(item.id, value);
                    }
                }
                resolve(data);
            };
        });
    }

    private upgradeExistingStores(db: IDBDatabase, objects: PersistedObject<any>[], storeNames: DOMStringList): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (storeNames.length === 0) {
                return resolve();
            }
            const transaction = db.transaction([...storeNames], 'readwrite');

            for (const obj of objects) {
                await this.tryUpgradeStore(transaction.objectStore(obj.getPersistedKey()), obj);
            }

            transaction.onerror = () => reject(transaction.error);
            transaction.oncomplete = () => resolve();
        });
    }

    private tryUpgradeStore(store: IDBObjectStore, obj: PersistedObject<any>) {
        return new Promise((resolve, reject) => {
            this.logger.debug("Beginning store upgrade: " + obj.getPersistedKey());

            let req = store.getAll();
            req.onerror = () => reject(req.error);
            req.onsuccess = (event) => {
                const data = (event.target as IDBRequest).result;
                const model = obj.getPersistedModel();

                let pendingUpdates = 0;
                let completed = 0;

                const checkCompletion = () => {
                    if (completed === pendingUpdates) {
                        this.logger.debug("Store upgrade complete: " + obj.getPersistedKey() + " (" + pendingUpdates + " items updated)");
                        resolve(undefined);
                    }
                };

                for (const item of data) {
                    const result = this.upgradeItem(item, model);
                    if (result.changed) {
                        pendingUpdates++;
                        const putReq = store.put(result.value);
                        putReq.onsuccess = () => {
                            completed++;
                            checkCompletion();
                        };
                        putReq.onerror = () => reject(putReq.error);
                    }
                }

                if (pendingUpdates === 0) {
                    this.logger.debug("Store upgrade complete: " + obj.getPersistedKey() + " (no changes needed)");
                    resolve(undefined);
                }
            };
        });
    }

    private upgradeItem(item: any, model: any): { changed: boolean, value: any } {
        if (model === null || model === undefined) {
            return {changed: false, value: item};
        }

        // Model is a primitive type (string, number, boolean, etc.)
        if (typeof model !== 'object') {
            if (item === null || item === undefined) {
                return {changed: true, value: this.getDefaultForType(model)};
            }
            return {changed: false, value: item};
        }

        // Model is an array - model contains one element representing the schema of each list item
        if (Array.isArray(model)) {
            if (!Array.isArray(item)) {
                return {changed: true, value: []};
            }
            if (model.length === 0) {
                return {changed: false, value: item};
            }
            const elementModel = model[0];
            let anyChanged = false;
            const upgradedArray = item.map((el: any) => {
                const result = this.upgradeItem(el, elementModel);
                if (result.changed) anyChanged = true;
                return result.value;
            });
            return {changed: anyChanged, value: anyChanged ? upgradedArray : item};
        }

        // Model is an object with key:value pairs
        if (typeof item !== 'object' || item === null) {
            return {changed: true, value: this.createDefaultFromModel(model)};
        }

        let anyChanged = false;
        const upgraded = {...item};
        const addedFields: string[] = [];
        for (const key of Object.keys(model)) {
            if (!(key in upgraded)) {
                // Missing field - initialize with default
                upgraded[key] = this.createDefaultFromModel(model[key]);
                addedFields.push(key);
                anyChanged = true;
            } else {
                // Recursively upgrade nested objects/arrays
                const result = this.upgradeItem(upgraded[key], model[key]);
                if (result.changed) {
                    upgraded[key] = result.value;
                    anyChanged = true;
                }
            }
        }
        if (addedFields.length > 0) {
            this.logger.debug("Added missing fields: [" + addedFields.join(", ") + "]");
        }
        return {changed: anyChanged, value: anyChanged ? upgraded : item};
    }

    private createDefaultFromModel(model: any): any {
        if (model === null || model === undefined) {
            return null;
        }

        // Primitive type indicators
        if (typeof model === 'string') {
            return '';
        }
        if (typeof model === 'number') {
            return 0;
        }
        if (typeof model === 'boolean') {
            return false;
        }

        // Array - return empty array
        if (Array.isArray(model)) {
            return [];
        }

        // Object - create with default values for each key
        if (typeof model === 'object') {
            const result: any = {};
            for (const key of Object.keys(model)) {
                result[key] = this.createDefaultFromModel(model[key]);
            }
            return result;
        }

        return null;
    }

    private getDefaultForType(model: any): any {
        if (typeof model === 'string') {
            return '';
        }
        if (typeof model === 'number') {
            return 0;
        }
        if (typeof model === 'boolean') {
            return false;
        }
        return null;
    }
}
