import {Editor} from "../../Editor";
import {LanguageBase} from "../../../core/lang/LanguageBase";
import {IncrementalLexer} from "../../../core/lang/syntax/builder/lexer/IncrementalLexer";
import {IncrementalHighlighter} from "../../../core/lang/highlighter/IncrementalHighlighter";
import {DocumentModificationEvent} from "../document/events/DocumentModificationEvent";
import {HighlighterBase} from "../../../core/lang/highlighter/HighlighterBase";
import {IParser} from "../../../core/lang/syntax/builder/parser/IParser";
import {ASTBuilder} from "../../../core/lang/syntax/builder/parser/builder/ASTBuilder";
import {SynNode} from "../../../core/lang/syntax/api/SynNode";
import {SynFileImpl} from "../../../core/lang/syntax/impl/SynFileImpl";
import {Scheduler} from "../../../core/scheduler/Scheduler";

/**
 * Class associated with an editor that holds the current language, lexer, parser, highlighter as
 * well as their associated states. It is responsible for running the lexer / highlighter / parser / etc...
 *
 * @author Atzitz Amos
 * @date 10/18/2025
 * @since 1.0.0
 */
export class LangService {
    private currentLanguage: LanguageBase | null = null;  // TODO: support null language (plain text)
    private myLexer: IncrementalLexer | null = null;

    private myHighlighter: HighlighterBase | null = null;
    private myIncrementalHighlighter: IncrementalHighlighter | null = null;
    private myParser: IParser | null = null;  // TODO: support incremental parsing
    private debugProduction: SynNode[];
    constructor(private editor: Editor) {
        editor.getEventBus().subscribe(this, DocumentModificationEvent.SUBSCRIBER, this.onDocumentChange);
    }

    public getCurrentLanguage(): LanguageBase | null {
        return this.currentLanguage;
    }

    public setCurrentLanguage(language: LanguageBase | null): void {
        this.currentLanguage = language;

        this.setupLanguageComponents();
    }

    public getLexer(): IncrementalLexer | null {
        return this.myLexer;
    }

    public getHighlighter(): HighlighterBase | null {
        return this.myHighlighter;
    }

    public getIncrementalHighlighter(): IncrementalHighlighter | null {
        return this.myIncrementalHighlighter;
    }

    public makeParser(builder: ASTBuilder): IParser | null {
        if (this.currentLanguage) {
            return this.currentLanguage.createParser(builder);
        }
        return null;
    }

    private setupLanguageComponents() {
        if (this.currentLanguage) {
            this.myLexer = this.currentLanguage.createLexer();
            this.myHighlighter = this.currentLanguage.createHighlighter();
            this.myIncrementalHighlighter = new IncrementalHighlighter(this);
        } else {
            this.myLexer = null;
            this.myHighlighter = null;
        }
    }

    private onDocumentChange(event: DocumentModificationEvent) {
        this.myLexer!.relex(event);  // TODO: Support default language

        const highlightsHolder = this.editor.getWidgetManager().getHighlightsHolder();
        highlightsHolder.clear();
        this.myIncrementalHighlighter?.highlight(this.myLexer!.createTokenStream(), highlightsHolder);

        this.scheduleParsing();
    }

    private scheduleParsing() {
        Scheduler.debounce(() => {
            const start = performance.now();
            const builder = new ASTBuilder(this.myLexer!.createTokenStream(), new SynFileImpl(this.editor.getOpenedFile()));
            this.makeParser(builder)?.parse().then(() => {
                console.log("Successfully parsed "
                    + this.editor.getOpenedDocument().getLineCount()
                    + " lines (" + this.editor.getOpenedDocument().getTotalDocumentLength()
                    + " chars) in "
                    + (performance.now() - start) + "ms");
                this.debugProduction = builder.getProduction();
            });
        }, 10 * Math.log(this.editor.getOpenedDocument().getTotalDocumentLength()));
    }
}
