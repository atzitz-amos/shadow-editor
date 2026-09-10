import {SynTree} from "../../../syntax/api/tree/SynTree";
import {TokenStream} from "../../../syntax/builder/tokens/TokenStream";
import {FormattingBlock} from "../nodes/FormattingBlock";

/**
 *
 * @author Atzitz Amos
 * @date 9/6/2026
 * @since 1.0.0
 */
export interface FormattingBlockVisitor {
    format(tree: SynTree, stream: TokenStream): FormattingBlock;
}
