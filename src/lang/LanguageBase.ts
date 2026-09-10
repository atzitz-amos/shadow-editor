import {IncrementalLexer} from "./syntax/builder/lexer/IncrementalLexer";
import {ExtensionPointSupplier} from "../core/plugins/extensionPoints/ExtensionPointSupplier";
import {HighlighterBase} from "./highlighter/HighlighterBase";

export abstract class LanguageBase implements ExtensionPointSupplier {
    public static readonly PLAIN_TEXT = new class extends LanguageBase {
        public getKey(): string {
            return "plainText"
        }

        public getDisplayName(): string {
            return "Plain Text"
        }

        public createLexer(): IncrementalLexer {
            throw new Error("Method not implemented.");
        }

        public createHighlighter(): HighlighterBase {
            throw new Error("Method not implemented.");
        }

    };

    public abstract getKey(): string;

    public abstract getDisplayName(): string;

    // Not yet supported
    public getIcon(): string {
        throw new Error("Method not implemented.");
    }

    public abstract createLexer(): IncrementalLexer;

    public abstract createHighlighter(): HighlighterBase;
}