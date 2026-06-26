import {Editor} from "../../Editor";
import {LanguageBase} from "../../../core/lang/LanguageBase";
import {IncrementalLexer} from "../../../core/lang/syntax/builder/lexer/IncrementalLexer";
import {IncrementalHighlighter} from "../../../core/lang/highlighter/IncrementalHighlighter";
import {DocumentModificationEvent} from "../document/events/DocumentModificationEvent";
import {HighlighterBase} from "../../../core/lang/highlighter/HighlighterBase";
import {Document} from "../document/Document";
import {TokenCache} from "./TokenCache";
import {EditorLanguageChanged} from "./events/EditorLanguageChanged";
import {Scheduler} from "../../../core/scheduler/Scheduler";
import {ASTBuilder} from "../../../core/lang/syntax/builder/parser/builder/ASTBuilder";
import {SynFileImpl} from "../../../core/lang/syntax/impl/SynFileImpl";
import {SynFile} from "../../../core/lang/syntax/api/SynFile";
import {SynTreeChangedEvent} from "./events/SynTreeChangedEvent";
import {EmptyKillSignal} from "../../../core/lang/syntax/builder/parser/builder/KillSignal";

/**
 * Class associated with an editor that holds the current language, lexer, parser, highlighter as
 * well as their associated states. It is responsible for running the lexer / highlighter / parser / etc...
 *
 * @author Atzitz Amos
 * @date 10/18/2025
 * @since 1.0.0
 */
export class LangService {
    private currentLanguage: LanguageBase | null = null;
    private myLexer: IncrementalLexer | null = null;

    private myHighlighter: HighlighterBase | null = null;
    private myIncrementalHighlighter: IncrementalHighlighter | null = null;

    private synFile: SynFile;

    private isSynTreeClean: boolean = false;

    constructor(private editor: Editor) {
        editor.getEventBus().subscribe(this, DocumentModificationEvent.SUBSCRIBER, this.onDocumentChange);
    }

    public getSynFile(): SynFile {
        return this.synFile;
    }

    public getCurrentLanguage(): LanguageBase | null {
        return this.currentLanguage;
    }

    public setCurrentLanguage(language: LanguageBase | null): void {
        this.currentLanguage = language;

        this.setupLanguageComponents();

        this.editor.getEventBus().syncPublish(new EditorLanguageChanged(this.editor, language));
    }

    public forceUpdate(document: Document) {
        this.myLexer?.lexAll(document)
        this.rehighlight(document.getTokenCache());
        this.scheduleParsing(document);
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
        if (!this.currentLanguage) return;
        this.myLexer!.relex(event);

        this.rehighlight(event.getDocument().getTokenCache());
        this.scheduleParsing(event.getDocument());
    }

    private rehighlight(tokenCache: TokenCache) {
        const highlightsHolder = this.editor.getWidgetManager().getHighlightsHolder();
        highlightsHolder.clear();
        this.myIncrementalHighlighter?.highlight(tokenCache.createTokenStream(), highlightsHolder);
    }

    private scheduleParsing(document: Document) {
        this.isSynTreeClean = false;

        Scheduler.debounce(() => {
            const start = performance.now();
            const builder = new ASTBuilder(
                document.getTokenCache().createTokenStream(),
                new EmptyKillSignal(),
                new SynFileImpl(document)
            );

            this.currentLanguage?.createParser(builder).parse();
            // console.log("Successfully parsed "
            //     + this.editor.getOpenedDocument().getLineCount()
            //     + " lines (" + this.editor.getOpenedDocument().getTotalDocumentLength()
            //     + " chars) in "
            //     + (performance.now() - start) + "ms");
            this.synFile = builder.close();

            this.isSynTreeClean = true;
            this.editor.getEventBus().syncPublish(new SynTreeChangedEvent(this.editor, this.synFile, this.currentLanguage!));
        }, 10 * Math.log(this.editor.getOpenedDocument().getTotalDocumentLength()));
    }

    isSynTreeDirty() {
        return !this.isSynTreeClean;
    }
}
