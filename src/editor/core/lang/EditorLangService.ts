import {Editor} from "../../Editor";
import {LanguageBase} from "../../../lang/LanguageBase";
import {IncrementalLexer} from "../../../lang/syntax/builder/lexer/IncrementalLexer";
import {IncrementalHighlighter} from "../../../lang/highlighter/IncrementalHighlighter";
import {DocumentModificationEvent} from "../document/events/DocumentModificationEvent";
import {HighlighterBase} from "../../../lang/highlighter/HighlighterBase";
import {Document} from "../document/Document";
import {TokenCache} from "../document/TokenCache";
import {EditorLanguageChanged} from "./events/EditorLanguageChanged";
import {SynFileImpl} from "../../../lang/syntax/impl/filesystem/SynFileImpl";
import {SynFile} from "../../../lang/syntax/api/filesystem/SynFile";
import {SynTreeChangedEvent} from "./events/SynTreeChangedEvent";
import {EmptyKillSignal, TimeoutKillSignal} from "../../../core/utils/KillSignal";
import {ASTRecoveryBuilder} from "../../../lang/syntax/builder/parser/optimizer/recovery/ASTRecoveryBuilder";
import {ASTCheckpoint} from "../../../lang/syntax/builder/parser/optimizer/recovery/ASTCheckpoint";
import {ASTRecoveryInfo} from "../../../lang/syntax/builder/parser/optimizer/recovery/ASTRecoveryInfo";

/**
 * Class associated with an editor that holds the current language, lexer, parser, highlighter as
 * well as their associated states. It is responsible for running the lexer / highlighter / parser / etc...
 *
 * @author Atzitz Amos
 * @date 10/18/2025
 * @since 1.0.0
 */
export class EditorLangService {
    private currentLanguage: LanguageBase | null = null;
    private myLexer: IncrementalLexer | null = null;

    private myHighlighter: HighlighterBase | null = null;
    private myIncrementalHighlighter: IncrementalHighlighter | null = null;

    private synFile: SynFile;

    private isSynTreeClean: boolean = false;

    private checkpoints: ASTCheckpoint[] = [];

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

    isSynTreeDirty() {
        return !this.isSynTreeClean;
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
        const modifiedRange = this.myLexer!.relex(event);

        this.rehighlight(event.getDocument().getTokenCache());
        this.scheduleParsing(event.getDocument(), new ASTRecoveryInfo(
            this.checkpoints,
            event.getOffset(),
            event.getTextDelta(),
            modifiedRange
        ));
    }

    private rehighlight(tokenCache: TokenCache) {
        const highlightsHolder = this.editor.getOpenedDocument().getHighlightsHolder();
        highlightsHolder.clear();
        this.myIncrementalHighlighter?.highlight(tokenCache.createTokenStream(), highlightsHolder);
    }

    private scheduleParsing(document: Document, recoveryInfo?: ASTRecoveryInfo) {
        this.isSynTreeClean = false;

        if (!this.currentLanguage) return;

        this.synFile = new SynFileImpl(document.getAssociatedFile()!);

        const synDocument = this.synFile.getSynDocument();

        const builder = new ASTRecoveryBuilder(
            synDocument,
            this.currentLanguage,
            !!window["isParseTimeBombDisabled"] ? new EmptyKillSignal() : new TimeoutKillSignal(1000),
        );
        if (recoveryInfo) {
            builder.enableStatisticsCollection();
            builder.setRecoveryMode(recoveryInfo)
        }

        let time0 = performance.now();
        this.currentLanguage.createParser(builder).parse();
        time0 = performance.now() - time0;

        console.log("Successfully parsed "
            + this.editor.getOpenedDocument().getLineCount()
            + " lines (" + this.editor.getOpenedDocument().getTotalDocumentLength()
            + " chars) in "
            + time0 + "ms");
        // if (!recoveryInfo || builder.getStatistics().recoveryMode === 'disabled') {
        //     console.log(`Recovery parser: disabled`);
        // } else {
        //     const stats = builder.getStatistics();
        //     const textReuse = (100 * stats.totalTextReused / (stats.totalTextLength || 0)).toFixed(2);
        //     console.log(`Recovery parser: enabled, reused ${stats.totalCodeblocksReused}/${stats.totalCodeblocks} codeblocks, ${stats.totalNodesReused}/${stats.totalNodes} nodes (${textReuse}% of text)`);
        //     const builder1 = new ASTRecoveryBuilder(
        //         synDocument,
        //         this.currentLanguage,
        //         !!window["isParseTimeBombDisabled"] ? new EmptyKillSignal() : new TimeoutKillSignal(1000),
        //     );
        //     let time1 = performance.now();
        //     this.currentLanguage.createParser(builder1).parse();
        //     console.log("\tRegular parsing: " + (performance.now() - time1) + "ms");
        //     console.log("\tRecovery parsing: " + time0 + "ms");
        // }

        const synTree = builder.getTree();
        synDocument.commit(synTree, document.getModificationTimestamp());

        this.checkpoints = builder.getCheckpoints();

        this.isSynTreeClean = true;
        this.editor.getEventBus().syncPublish(new SynTreeChangedEvent(this.editor, synDocument, this.currentLanguage!));
    }
}
