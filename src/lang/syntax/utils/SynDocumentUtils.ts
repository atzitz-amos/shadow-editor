import {Document} from "../../../editor/core/document/Document";
import {SynNode} from "../api/SynNode";

/**
 *
 * @author Atzitz Amos
 * @date 7/5/2026
 * @since 1.0.0
 */
export class SynDocumentUtils {
    public static getDocumentLengthTier(document: Document): number {
        return Math.log(document.getTotalDocumentLength());
    }

    static getIndentFor(node: SynNode) {
        const document = node.getSynDocument().getDocument();
        const line = document.getLineAt(node.getTextRange().start);
        return line.getIndentationSize();
    }
}
