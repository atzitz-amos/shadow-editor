import {LangRegistry} from "../../../lang/LangRegistry";
import {ProjectFile} from "../../../core/project/filesystem/tree/ProjectFile";
import {Document} from "./Document";
import {UUIDHelper} from "../../utils/UUIDHelper";
import {Service} from "../../../core/threaded/service/Service";
import {GlobalState} from "../../../core/global/GlobalState";
import {DocumentModificationEvent} from "./events/DocumentModificationEvent";
import {SynDocumentManager} from "../../../lang/syntax/manager/SynDocumentManager";
import {LanguageBase} from "../../../lang/LanguageBase";

/**
 *
 * @author Atzitz Amos
 * @date 7/2/2026
 * @since 1.0.0
 */
@Service
export class EditorDocumentManager {
    private static readonly instance: EditorDocumentManager = new EditorDocumentManager();

    private readonly documents: Map<string, Document> = new Map();

    public static getInstance() {
        return this.instance;
    }

    public static getDocumentForFile(file: ProjectFile): Document {
        return this.getInstance().getDocumentForFile(file);
    }

    public static getDocumentById(id: string) {
        return this.getInstance().getDocumentForId(id);
    }

    static getDocumentId(document: Document) {
        for (const [id, doc] of this.getInstance().documents.entries()) {
            if (doc === document) {
                return id;
            }
        }
        const uuid = UUIDHelper.newUUID();
        this.getInstance().documents.set(uuid, document);
        return uuid;
    }

    public getDocumentForId(id: string): Document | null {
        if (this.documents.has(id)) return this.documents.get(id)!;
        return null;
    }

    static createVirtualDocument(text: string, language: LanguageBase) {
        const document = new Document(text, language);
        this.getInstance().prepare(document);
        return document;
    }

    public getDocumentForFile(file: ProjectFile): Document {
        if (this.documents.has(file.getId())) return this.documents.get(file.getId())!;
        return this.createDocumentForFile(file);
    }

    public createDocumentForFile(file: ProjectFile): Document {
        let fileTypeHandler = LangRegistry.getInstance().getFileTypeHandler(file);
        const document = new Document(
            file.getCachedContent() ?? "",
            fileTypeHandler ? fileTypeHandler.getLanguageForFile(file) : null);
        document.linkFile(file);

        this.prepare(document);
        this.documents.set(file.getId(), document);
        return document;
    }

    public begin() {
        GlobalState.getMainEventBus().subscribe(this, DocumentModificationEvent.SUBSCRIBER, e => {
            this.onDocumentChange(e);
        });
    }

    private onDocumentChange(event: DocumentModificationEvent) {
        const language = event.getLanguage();
        if (!language) return;

        const lexer = LangRegistry.getLexer(language);
        const modifiedRange = lexer.relex(event);

        const highlighter = LangRegistry.getHighlighter(language);
        const holder = event.getDocument().getHighlightsHolder();
        holder.clear();
        highlighter.highlight(event.getDocument().getTokenCache().createTokenStream(), holder);

        SynDocumentManager.getInstance().notifyModified(event.getDocument(), event, modifiedRange);
    }

    private prepare(document: Document) {
        const language = document.getLanguage();
        if (!language) return;

        const lexer = LangRegistry.getLexer(language);
        lexer.lexAll(document);

        const highlighter = LangRegistry.getHighlighter(language);
        highlighter.highlight(document.getTokenCache().createTokenStream(), document.getHighlightsHolder());
    }
}
