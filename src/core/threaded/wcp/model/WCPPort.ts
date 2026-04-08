export class WCPPort {
    private static readonly byName = new Map<string, WCPPort>();
    private static readonly byId = new Map<string, WCPPort>();

    public static forName(name: string): WCPPort {
        const normalizedName = name.trim();
        if (!normalizedName) {
            throw new Error("WCPPort name must not be empty.");
        }

        const existing = this.byName.get(normalizedName);
        if (existing) {
            return existing;
        }

        const created = new WCPPort(normalizedName, WCPPort.hash(normalizedName));
        this.byName.set(normalizedName, created);
        this.byId.set(created.getId(), created);
        return created;
    }

    public static forId(id: string): WCPPort {
        const existing = this.byId.get(id);
        if (!existing) {
            throw new Error(`Unknown WCPPort id: ${id}`);
        }

        return existing;
    }

    private constructor(
        private readonly name: string,
        private readonly id: string
    ) {
    }

    public getName(): string {
        return this.name;
    }

    public getId(): string {
        return this.id;
    }

    private static hash(value: string): string {
        let hash = 5381;
        for (let i = 0; i < value.length; i++) {
            hash = (hash * 33) ^ value.charCodeAt(i);
        }

        return "p_" + (hash >>> 0).toString(16);
    }
}

