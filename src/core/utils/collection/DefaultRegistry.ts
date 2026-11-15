/*
 * Author: Atzitz Amos
 * Date: 10/5/2025
 */

export class DefaultRegistry<K, V> {
    private registry = new Map<K, V[]>();

    public register(key: K, value: V) {
        if (!this.registry.has(key)) {
            this.registry.set(key, []);
        }
        this.registry.get(key)!.push(value);
    }

    public unregister(key: K, value: V) {
        if (this.registry.has(key)) {
            const values = this.registry.get(key)!;
            const index = values.indexOf(value);
            if (index !== -1) {
                values.splice(index, 1);
            }
            if (values.length === 0) {
                this.registry.delete(key);
            }
        }
    }

    public unregisterAll(key: K) {
        this.registry.delete(key);
    }

    public getAll(key: K): V[] {
        return this.registry.get(key) || [];
    }

    public getAllKeys(): K[] {
        return Array.from(this.registry.keys());
    }
}
