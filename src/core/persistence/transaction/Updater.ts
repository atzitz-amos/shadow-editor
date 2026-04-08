import {Logger, UseLogger} from "../../logging/Logger";

/**
 *
 * @author Atzitz Amos
 * @date 12/29/2025
 * @since 1.0.0
 */
@UseLogger("Updater")
export class Updater {
    private declare readonly logger: Logger;

    private readonly store: IDBObjectStore;
    private readonly queue: (() => Promise<void>)[] = [];

    constructor(store: IDBObjectStore) {
        this.store = store;
    }

    /**
     * Flush all queued operations and wait for them to complete.
     */
    async flush(): Promise<void> {
        const operations = [...this.queue];
        this.queue.length = 0;
        await Promise.all(operations.map(op => op()));
    }

    // ============ Basic CRUD Operations ============

    put<T extends { id: string }>(item: T): this {
        this.logger.debug("put: " + item.id + " -> " + JSON.stringify(item));
        this.queue.push(() => new Promise((resolve, reject) => {
            const req = this.store.put(item);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        }));
        return this;
    }

    get<T>(id: string): Promise<T | undefined> {
        return new Promise((resolve, reject) => {
            const req = this.store.get(id);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    delete(id: string): this {
        this.logger.debug("delete: " + id);
        this.queue.push(() => new Promise((resolve, reject) => {
            const req = this.store.delete(id);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        }));
        return this;
    }

    clear(): this {
        this.logger.debug("clear store");
        this.queue.push(() => new Promise((resolve, reject) => {
            const req = this.store.clear();
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        }));
        return this;
    }

    getAll<T>(): Promise<T[]> {
        return new Promise((resolve, reject) => {
            const req = this.store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    // ============ Key-Value Operations ============

    /**
     * Set a value by key. Creates a new entry or updates existing.
     */
    set<T>(key: string, value: T): this {
        return this.put({id: key, value} as any);
    }

    /**
     * Get a value by key.
     */
    async getValue<T>(key: string): Promise<T | undefined> {
        const item = await this.get<{ id: string, value: T }>(key);
        return item?.value;
    }

    /**
     * Check if a key exists.
     */
    has(key: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const req = this.store.getKey(key);
            req.onsuccess = () => resolve(req.result !== undefined);
            req.onerror = () => reject(req.error);
        });
    }

    // ============ Object Field Operations ============

    /**
     * Update specific fields of an object by key.
     */
    updateFields<T extends { id: string }>(id: string, fields: Partial<T>): this {
        this.queue.push(async () => {
            const existing = await this.get<T>(id);
            if (existing) {
                await this.putImmediate({...existing, ...fields});
            } else {
                await this.putImmediate({id, ...fields} as T);
            }
        });
        return this;
    }

    /**
     * Set a nested field within an object using dot notation path.
     * Example: setField("settings", "theme.colors.primary", "#fff")
     */
    setField<T extends { id: string }>(id: string, path: string, value: any): this {
        this.queue.push(async () => {
            const existing = await this.get<T>(id) || {id} as T;
            const keys = path.split('.');
            let current: any = existing;

            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (!(key in current) || typeof current[key] !== 'object') {
                    current[key] = {};
                }
                current = current[key];
            }

            current[keys[keys.length - 1]] = value;
            await this.putImmediate(existing);
        });
        return this;
    }

    /**
     * Delete a field from an object.
     */
    deleteField<T extends { id: string }>(id: string, field: string): this {
        this.queue.push(async () => {
            const existing = await this.get<T>(id);
            if (existing && field in existing) {
                delete (existing as any)[field];
                await this.putImmediate(existing);
            }
        });
        return this;
    }

    // ============ List Operations ============

    /**
     * Push an item to a list field within an object.
     */
    pushToList<T extends { id: string }>(id: string, field: string, item: any): this {
        this.queue.push(async () => {
            const existing = await this.get<T>(id) || {id} as T;
            const list = (existing as any)[field];

            if (Array.isArray(list)) {
                list.push(item);
            } else {
                (existing as any)[field] = [item];
            }

            await this.putImmediate(existing);
        });
        return this;
    }

    /**
     * Remove an item from a list field by index.
     */
    removeFromListByIndex<T extends { id: string }>(id: string, field: string, index: number): this {
        this.queue.push(async () => {
            const existing = await this.get<T>(id);
            if (existing) {
                const list = (existing as any)[field];
                if (Array.isArray(list) && index >= 0 && index < list.length) {
                    list.splice(index, 1);
                    await this.putImmediate(existing);
                }
            }
        });
        return this;
    }

    /**
     * Remove items from a list field by predicate.
     */
    removeFromListWhere<T extends { id: string }>(id: string, field: string, predicate: (item: any) => boolean): this {
        this.queue.push(async () => {
            const existing = await this.get<T>(id);
            if (existing) {
                const list = (existing as any)[field];
                if (Array.isArray(list)) {
                    (existing as any)[field] = list.filter(item => !predicate(item));
                    await this.putImmediate(existing);
                }
            }
        });
        return this;
    }

    /**
     * Update an item in a list field by index.
     */
    updateListItem<T extends { id: string }>(id: string, field: string, index: number, item: any): this {
        this.queue.push(async () => {
            const existing = await this.get<T>(id);
            if (existing) {
                const list = (existing as any)[field];
                if (Array.isArray(list) && index >= 0 && index < list.length) {
                    list[index] = item;
                    await this.putImmediate(existing);
                }
            }
        });
        return this;
    }

    /**
     * Clear all items from a list field.
     */
    clearList<T extends { id: string }>(id: string, field: string): this {
        this.queue.push(async () => {
            const existing = await this.get<T>(id);
            if (existing) {
                (existing as any)[field] = [];
                await this.putImmediate(existing);
            }
        });
        return this;
    }

    // ============ Batch Operations ============

    /**
     * Put multiple items at once.
     */
    putAll<T extends { id: string }>(items: T[]): this {
        for (const item of items) {
            this.put(item);
        }
        return this;
    }

    /**
     * Delete multiple items by their IDs.
     */
    deleteAll(ids: string[]): this {
        for (const id of ids) {
            this.delete(id);
        }
        return this;
    }

    // ============ Internal Helpers ============

    private putImmediate<T extends { id: string }>(item: T): Promise<void> {
        return new Promise((resolve, reject) => {
            const req = this.store.put(item);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }
}
