import {IncrementalLexer} from "./builder/lexer/IncrementalLexer";
import {ExtensionPointSupplier} from "../plugins/extensionPoints/ExtensionPointSupplier";
import {HighlighterBase} from "./highlighter/HighlighterBase";
import {ASTBuilder} from "./builder/parser/builder/ASTBuilder";
import {IParser} from "./builder/parser/IParser";

export abstract class LanguageBase implements ExtensionPointSupplier {
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

    public abstract createLexer(): IncrementalLexer;

    public abstract createHighlighter(): HighlighterBase;

    public abstract createParser(builder: ASTBuilder): IParser;
}