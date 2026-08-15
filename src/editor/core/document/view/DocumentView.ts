import {Document} from "../Document";
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
        this.scrollX = scrollX;
        this.scrollY = scrollY;
        this.caretOffset = caretOffset;
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
