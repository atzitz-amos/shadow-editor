import {Document} from "../../../editor/core/document/Document";
import {SynDocument} from "../api/document/SynDocument";
import {CollectionUtils} from "../../../editor/utils/collection/CollectionUtils";
import {SynDocumentImpl} from "../impl/document/SynDocumentImpl";
import {SynFile} from "../api/filesystem/SynFile";
import {Service, ServiceImpl} from "../../../core/threaded/service/Service";
import {SynFileImpl} from "../impl/filesystem/SynFileImpl";
import {DocumentModificationEvent} from "../../../editor/core/document/events/DocumentModificationEvent";
import {TextRange} from "../../../editor/core/coordinate/range/TextRange";
import {ASTRecoveryInfo} from "../builder/parser/optimizer/recovery/ASTRecoveryInfo";
import {ASTRecoveryBuilder} from "../builder/parser/optimizer/recovery/ASTRecoveryBuilder";
import {EmptyKillSignal, TimeoutKillSignal} from "../../../core/utils/KillSignal";
import {Editor} from "../../../editor/Editor";
import {LangRegistry} from "../../LangRegistry";

/**
 *
 * @author Atzitz Amos
 * @date 7/2/2026
 * @since 1.0.0
 */
@Service
export class SynDocumentManager implements ServiceImpl {
    private static instance: SynDocumentManager = new SynDocumentManager();
    private readonly documents: Map<Document, SynDocument> = new Map();

    public static getInstance() {
        return this.instance;
    }

    public static createSynDocument(document: Document, file?: SynFile): SynDocument {
        if (!file && document.getAssociatedFile()) {
            file = new SynFileImpl(document.getAssociatedFile()!);
        }
        const synDocument = new SynDocumentImpl(document, file ?? null);
        this.getInstance().parse(synDocument);
        return synDocument;
    }

    public static createVirtualSynDocument(document: Document): SynDocument {
        const synDocument = new SynDocumentImpl(document, null);
        this.getInstance().parse(synDocument);
        return synDocument;
    }

    public static getSynDocument(document: Document): SynDocument {
        return this.getInstance().getSynDocument(document);
    }

    public static getOpenedSynDocument(editor: Editor): SynDocument {
        return this.getInstance().getOpenedSynDocument(editor);
    }

    public getOpenedSynDocument(editor: Editor) {
        return this.getSynDocument(editor.getOpenedDocument());
    }

    public isCached(document: Document): boolean {
        return this.documents.has(document);
    }

    public getCachedSynDocument(document: Document): SynDocument | null {
        return this.documents.get(document) ?? null;
    }

    public getSynDocument(document: Document): SynDocument {
        return CollectionUtils.getOrSet(
            this.documents,
            document,
            () => SynDocumentManager.createSynDocument(document));
    }

    begin(): void {
    }

    parse(synDocument: SynDocument, recoveryInfo?: ASTRecoveryInfo): void {
        let builder = new ASTRecoveryBuilder(
            synDocument,
            synDocument.getLanguage()!,
            !!window["isParseTimeBombDisabled"] ? new EmptyKillSignal() : new TimeoutKillSignal(1000),
        );

        if (recoveryInfo) {
            builder.setRecoveryMode(recoveryInfo);
        }

        const parser = LangRegistry.createParser(synDocument.getLanguage()!, builder);
        parser.parse();

        const tree = builder.getTree();
        synDocument.commit(tree, builder.getCheckpoints(), synDocument.getDocument().getModificationTimestamp());
    }

    notifyModified(document: Document, event: DocumentModificationEvent, lexerInvalidRange: TextRange) {
        const synDocument = this.getSynDocument(document);

        const checkpoints = synDocument.getCheckpoints();
        if (!checkpoints) {
            this.parse(synDocument);
        } else {
            this.parse(synDocument, new ASTRecoveryInfo(
                checkpoints,
                event.getOffset(),
                event.getTextDelta(),
                lexerInvalidRange
            ));
        }
    }
}
