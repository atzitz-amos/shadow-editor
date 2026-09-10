import {SynTree} from "../api/tree/SynTree";
import {TokenStream} from "../builder/tokens/TokenStream";
import {LanguageBase} from "../../LanguageBase";
import {SynDocumentManager} from "../manager/SynDocumentManager";

/**
 *
 * @author Atzitz Amos
 * @date 9/9/2026
 * @since 1.0.0
 */
export class QuickParseUtils {
    public static quickParse(language: LanguageBase, text: string): QuickParseResult {
        const document = SynDocumentManager.createVirtualSynDocumentForText(text, language);
        return {
            tokenStream: document.makeTokenStream(),
            tree: document.getTree()
        }
    }
}


export type QuickParseResult = { tokenStream: TokenStream, tree: SynTree };