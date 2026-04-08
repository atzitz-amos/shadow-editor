export class WCPEndpoint<TRequest, TResponse> {
    constructor(
        private readonly name: string,
        private readonly defaultTimeoutMs?: number
    ) {
        if (!name || !name.trim()) {
            throw new Error("WCPEndpoint name must not be empty.");
        }
    }

    public getName(): string {
        return this.name;
    }

    public getDefaultTimeoutMs(): number | undefined {
        return this.defaultTimeoutMs;
    }
}

