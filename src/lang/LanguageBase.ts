import {IncrementalLexer} from "./syntax/builder/lexer/IncrementalLexer";
import {ExtensionPointSupplier} from "../core/plugins/extensionPoints/ExtensionPointSupplier";
import {HighlighterBase} from "./highlighter/HighlighterBase";
import {Icon} from "../core/ui/icons/Icon";

export abstract class LanguageBase implements ExtensionPointSupplier {
    public static readonly PLAIN_TEXT = new class extends LanguageBase {
        public getKey(): string {
            return "plainText"
        }

        public getDisplayName(): string {
            return "Plain Text"
        }

        public getDefaultExtension(): string {
            return "";
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

    public abstract getDefaultExtension(): string;

    public abstract createLexer(): IncrementalLexer;

    public abstract createHighlighter(): HighlighterBase;

    public getIcon(): Icon | null {
        return null;
    }
}