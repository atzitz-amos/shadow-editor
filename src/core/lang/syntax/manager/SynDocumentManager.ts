import {Document} from "../../../../editor/core/document/Document";
import {SynDocument} from "../api/document/SynDocument";
import {CollectionUtils} from "../../../../editor/utils/collection/CollectionUtils";
import {SynDocumentImpl} from "../impl/document/SynDocumentImpl";
import {SynFile} from "../api/filesystem/SynFile";
import {Service, ServiceImpl} from "../../../threaded/service/Service";
import {GlobalState} from "../../../global/GlobalState";
import {SynParseRequestEvent} from "../../../../editor/core/lang/events/SynParseRequestEvent";
import {SynFileImpl} from "../impl/filesystem/SynFileImpl";

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
        return new SynDocumentImpl(document, file ?? null);
    }

    public static createVirtualSynDocument(document: Document): SynDocument {
        return new SynDocumentImpl(document, null);
    }

    public getSynDocument(document: Document): SynDocument {
        return CollectionUtils.getOrSet(
            this.documents,
            document,
            () => SynDocumentManager.createSynDocument(document));
    }

    begin(): void {
        GlobalState.getMainEventBus().subscribe(this, SynParseRequestEvent.SUBSCRIBER, event => {
            const document = event.getDocument()
            const synDocument = this.getSynDocument(document);

            synDocument.markDirty(true);

            // TODO: INCREMENTAL PARSING
        });
    }

    private reparse(synDocument: SynDocument) {

    }
}
