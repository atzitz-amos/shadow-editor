import {Serializable, SerializableType} from "../../../../core/persistence/serializable/Serializable";
import {EditorDocumentManager} from "../EditorDocumentManager";

/**
 *
 * @author Atzitz Amos
 * @date 8/10/2026
 * @since 1.0.0
 */
export class DocumentView implements Serializable {
    private readonly documentId: string;

    private scrollX: number;

    private scrollY: number;

    private caretOffset: Offset;


    constructor(documentId: string, scrollX: number, scrollY: number, caretOffset: Offset) {
        this.documentId = documentId;
        // Also rejects NaN, which IndexedDB stores as-is (unlike JSON) and `??` lets through
        this.scrollX = Number.isFinite(scrollX) ? scrollX : 0;
        this.scrollY = Number.isFinite(scrollY) ? scrollY : 0;
        this.caretOffset = Number.isFinite(caretOffset) ? caretOffset : 0;
    }

    public static deserializer(data: any) {
        return new DocumentView(
            data.documentId,
            data.scrollX,
            data.scrollY,
            data.caretOffset
        );
    }

    getDocument() {
        return EditorDocumentManager.getDocumentById(this.documentId)!;
    }

    getScrollX(): number {
        return this.scrollX;
    }

    getScrollY(): number {
        return this.scrollY;
    }

    getCaretOffset(): number {
        return this.caretOffset;
    }

    serialize(): SerializableType {
        return {
            "documentId": this.documentId,
            "scrollX": this.scrollX,
            "scrollY": this.scrollY,
            "caretOffset": this.caretOffset
        }
    }

    setCaretOffset(offset: Offset) {
        this.caretOffset = offset;
    }

    setScrollX(scrollX: number) {
        this.scrollX = scrollX;
    }

    setScrollY(scrollY: number) {
        this.scrollY = scrollY;
    }
}
