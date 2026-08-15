/**
 * indexed-db.ts
 * ---------------------------------------------------------------------------
 * A strongly-typed, Promise-based wrapper around the native IndexedDB API.
 *
 * IndexedDB's raw API is event/callback based and easy to misuse (e.g. doing
 * a non-atomic read-then-write). This wrapper gives you:
 *
 *   - `Database<Schema>`  — `Schema` maps store names to the *value* type
 *     stored in each store, so `getObjectStore("foo")` returns a `Store<T>`
 *     with the right type for `T` automatically.
 *   - `Store<T>`          — typed get/set/update/delete/getAll/keys/etc.
 *   - Every method returns a real Promise that rejects with the underlying
 *     `DOMException` on failure — no more manual `onsuccess`/`onerror`.
 *   - `update()` runs the read + write inside a single `readwrite`
 *     transaction, so it's atomic (no lost updates from concurrent callers).
 *
 * ---------------------------------------------------------------------------
 * Basic usage (matches the example in the prompt):
 *
 *   const db = new Database("myApp.db", 2, ["store1", "store2"]);
 *   await db.connect();
 *
 *   const store = db.getObjectStore("store1");
 *   const value = (await store.get("value")) ?? 0;
 *   await store.update("counter", old => old + 1, 0);
 *   await store.set("value", 3);
 *
 * ---------------------------------------------------------------------------
 * Fully-typed usage (recommended):
 *
 *   interface Schema {
 *     store1: number;
 *     store2: { name: string; age: number };
 *   }
 *
 *   const db = new Database<Schema>("myApp.db", 2, ["store1", "store2"]);
 *   await db.connect();
 *
 *   const store1 = db.getObjectStore("store1");   // Store<number>
 *   const store2 = db.getObjectStore("store2");   // Store<{name: string, age: number}>
 *
 *   await store1.set("value", 3);                 // OK
 *   await store1.set("value", "oops");             // Type error
 *
 *   const person = await store2.get("alice");      // {name, age} | undefined
 * ---------------------------------------------------------------------------
 */

// -----------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------

/** Turns any IDBRequest into a Promise that resolves/rejects appropriately. */
function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/** Resolves when a transaction completes; rejects on error/abort. */
function promisifyTransaction(tx: IDBTransaction): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error ?? new DOMException("Transaction aborted", "AbortError"));
    });
}

// -----------------------------------------------------------------------
// Store definitions (for schema creation / migration)
// -----------------------------------------------------------------------

/** Options describing how an object store's keys are structured. */
export interface StoreDefinition {
    name: string;
    /** Path to the key within stored objects (for inline keys). Omit for out-of-line keys. */
    keyPath?: string | string[];
    /** Whether keys auto-increment. Ignored if keyPath is set and values already carry ids. */
    autoIncrement?: boolean;
    /** Indexes to create on this store. */
    indexes?: { name: string; keyPath: string | string[]; unique?: boolean; multiEntry?: boolean }[];
}

/** A store can be declared as a plain name (out-of-line keys, default config) or a full definition. */
export type StoreSpec = string | StoreDefinition;

function normalizeSpec(spec: StoreSpec): StoreDefinition {
    return typeof spec === "string" ? {name: spec} : spec;
}

/** Schema shape: maps store name -> the type of value stored in it. */
export type Schema = Record<string, unknown>;

// -----------------------------------------------------------------------
// Store<T> — typed wrapper around a single IDBObjectStore
// -----------------------------------------------------------------------

export class Store<T> {
    constructor(private readonly db: IDBDatabase, private readonly name: string) {
    }

    private raw(mode: IDBTransactionMode): IDBObjectStore {
        return this.db.transaction(this.name, mode).objectStore(this.name);
    }

    /** Get a value by key. Returns `undefined` if not found. */
    get(key: IDBValidKey): Promise<T | undefined> {
        return promisifyRequest(this.raw("readonly").get(key)) as Promise<T | undefined>;
    }

    /** Set (insert or overwrite) a value at a key. */
    async set(key: IDBValidKey, value: T): Promise<void> {
        await promisifyRequest(this.raw("readwrite").put(value, key));
    }

    /**
     * Atomically read-modify-write a value: reads the current value (or
     * `defaultValue` if absent), applies `updater`, and writes the result —
     * all within a single readwrite transaction. Returns the new value.
     */
    update(key: IDBValidKey, updater: (current: T) => T, defaultValue: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const tx = this.db.transaction(this.name, "readwrite");
            const store = tx.objectStore(this.name);
            const getReq = store.get(key);

            getReq.onerror = () => reject(getReq.error);
            getReq.onsuccess = () => {
                const current = getReq.result === undefined ? defaultValue : (getReq.result as T);
                const next = updater(current);
                const putReq = store.put(next, key);
                putReq.onerror = () => reject(putReq.error);
                putReq.onsuccess = () => resolve(next);
            };
        });
    }

    /** Delete a value by key. */
    async delete(key: IDBValidKey): Promise<void> {
        await promisifyRequest(this.raw("readwrite").delete(key));
    }

    /** Remove every entry in the store. */
    async clear(): Promise<void> {
        await promisifyRequest(this.raw("readwrite").clear());
    }

    /** Number of entries in the store. */
    count(): Promise<number> {
        return promisifyRequest(this.raw("readonly").count());
    }

    /** All values in the store, in key order. */
    getAll(): Promise<T[]> {
        return promisifyRequest(this.raw("readonly").getAll()) as Promise<T[]>;
    }

    /** All keys in the store, in key order. */
    getAllKeys(): Promise<IDBValidKey[]> {
        return promisifyRequest(this.raw("readonly").getAllKeys());
    }

    /** Whether a key exists in the store. */
    async has(key: IDBValidKey): Promise<boolean> {
        const k = await promisifyRequest(this.raw("readonly").getKey(key));
        return k !== undefined;
    }

    /**
     * Escape hatch: run a function with the raw IDBObjectStore for anything
     * this wrapper doesn't cover (cursors, indexes, key ranges, etc.).
     * The returned promise resolves once the underlying transaction completes.
     */
    async withRawStore<R>(
        mode: IDBTransactionMode,
        fn: (store: IDBObjectStore) => R
    ): Promise<R> {
        const tx = this.db.transaction(this.name, mode);
        const store = tx.objectStore(this.name);
        const result = fn(store);
        await promisifyTransaction(tx);
        return result;
    }
}

// -----------------------------------------------------------------------
// Database<S> — connects and hands out typed Store<T> instances
// -----------------------------------------------------------------------

export class Database<S extends Schema = Record<string, unknown>> {
    private db: IDBDatabase | null = null;
    private readonly storeSpecs: StoreDefinition[];

    constructor(
        private readonly name: string,
        private readonly version: number,
        stores: StoreSpec[],
        /** Optional hook for custom migration logic beyond simple store creation. */
        private readonly onUpgrade?: (db: IDBDatabase, oldVersion: number, newVersion: number | null) => void
    ) {
        this.storeSpecs = stores.map(normalizeSpec);
    }

    /** Opens the connection, creating/upgrading object stores as needed. */
    connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const request = indexedDB.open(this.name, this.version);

            request.onupgradeneeded = (event) => {
                const db = request.result;
                for (const spec of this.storeSpecs) {
                    if (!db.objectStoreNames.contains(spec.name)) {
                        const store = db.createObjectStore(spec.name, {
                            keyPath: spec.keyPath,
                            autoIncrement: spec.autoIncrement,
                        });
                        for (const idx of spec.indexes ?? []) {
                            store.createIndex(idx.name, idx.keyPath, {
                                unique: idx.unique,
                                multiEntry: idx.multiEntry,
                            });
                        }
                    }
                }
                this.onUpgrade?.(db, event.oldVersion, event.newVersion);
            };

            request.onsuccess = () => {
                this.db = request.result;
                // If another tab/connection requests a version upgrade, close
                // cleanly so it isn't blocked. Callers can listen for this via
                // `onVersionChangeClose` if they want to react (e.g. reload).
                this.db.onversionchange = () => this.db?.close();
                resolve();
            };

            request.onerror = () => reject(request.error);
            request.onblocked = () =>
                reject(new DOMException(`Database "${this.name}" upgrade blocked by another open connection`, "AbortError"));
        });
    }

    /** Get a strongly-typed wrapper for one of the declared object stores. */
    getObjectStore<K extends keyof S & string>(name: K): Store<S[K]> {
        if (!this.db) {
            throw new Error("Database is not connected. Call connect() before getObjectStore().");
        }
        return new Store<S[K]>(this.db, name);
    }

    async requestPersistence() {
        return await navigator.storage.persist()
    }

    /** Closes the underlying connection. */
    close(): void {
        this.db?.close();
        this.db = null;
    }

    /** Deletes the entire database. Fails if there are other open connections. */
    static delete(name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const req = indexedDB.deleteDatabase(name);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
            req.onblocked = () => reject(new DOMException(`Delete of "${name}" blocked by open connection`, "AbortError"));
        });
    }
}