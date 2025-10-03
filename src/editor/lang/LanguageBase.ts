export abstract class LanguageBase {
    private static _instance: LanguageBase | null = null;
    private static _instanceName: string | null = null;

    // @ts-ignore
    public static get class(this: {
        new(): LanguageBase,
        _instance: LanguageBase | null,
        _instanceName: string | null
    }): LanguageBase {
        if (this._instance === null || this._instanceName !== this.name) {
            this._instance = new this();
            this._instanceName = this.name;
        }
        return this._instance;
    }

    public abstract getName(): string;

    // Not yet supported
    public getIcon(): string {
        throw new Error("Method not implemented.");
    }
}