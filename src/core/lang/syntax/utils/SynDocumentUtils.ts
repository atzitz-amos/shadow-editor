import {Document} from "../../../../editor/core/document/Document";

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
}
