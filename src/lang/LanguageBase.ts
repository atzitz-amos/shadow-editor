import {IncrementalLexer} from "./syntax/builder/lexer/IncrementalLexer";
import {ExtensionPointSupplier} from "../core/plugins/extensionPoints/ExtensionPointSupplier";
import {HighlighterBase} from "./highlighter/HighlighterBase";
import {ASTBuilder} from "./syntax/builder/parser/builder/ASTBuilder";
import {IParser} from "./syntax/builder/parser/IParser";
import {SynPrinter} from "./syntax/writer/SynPrinter";
import {SpacingFormatter} from "./codeStyle/spacing/SpacingFormatter";

export abstract class LanguageBase implements ExtensionPointSupplier {
    public abstract getKey(): string;

    public abstract getDisplayName(): string;

    // Not yet supported
    public getIcon(): string {
        throw new Error("Method not implemented.");
    }

    public abstract createLexer(): IncrementalLexer;

    public abstract createHighlighter(): HighlighterBase;

    public abstract createParser(builder: ASTBuilder): IParser;

    public abstract getSpacingFormatter(): SpacingFormatter;

    public abstract getPrinter(): SynPrinter;
}