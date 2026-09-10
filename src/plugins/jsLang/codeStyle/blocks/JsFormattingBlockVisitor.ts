import {JsSynVisitor} from "../../lang/syntax/visitors/JsSynVisitor";
import {FormattingBlockBuilder} from "../../../../lang/codeStyle/formatter/builder/FormattingBlockBuilder";
import {AbstractSynParentElement} from "../../../../lang/syntax/impl/tree/AbstractSynParentElement";
import {FormattingBlock, FormattingIndent} from "../../../../lang/codeStyle/formatter/nodes/FormattingBlock";
import {FormattingBreak} from "../../../../lang/codeStyle/formatter/nodes/FormattingBreak";
import {JsCodeStyleManager} from "../JsCodeStyleManager";
import {SynTree} from "../../../../lang/syntax/api/tree/SynTree";
import {SynNode} from "../../../../lang/syntax/api/SynNode";
import {JsStatement} from "../../lang/syntax/statements/JsStatement";
import {JsCodeBlock} from "../../lang/syntax/JsCodeBlock";
import {FormattingBlockVisitor} from "../../../../lang/codeStyle/formatter/builder/FormattingBlockVisitor";
import {TokenStream} from "../../../../lang/syntax/builder/tokens/TokenStream";
import {SynCodeBlock} from "../../../../lang/syntax/api/SynCodeBlock";

/**
 *
 * @author Atzitz Amos
 * @date 9/6/2026
 * @since 1.0.0
 */
export class JsFormattingBlockVisitor extends JsSynVisitor implements FormattingBlockVisitor {
    private readonly builder: FormattingBlockBuilder;

    private topLevelCodeblock: SynCodeBlock;

    constructor() {
        super();
        this.builder = new FormattingBlockBuilder(JsCodeStyleManager.getInstance(), this);
    }

    format(tree: SynTree, stream: TokenStream): FormattingBlock {
        this.topLevelCodeblock = tree.getToplevelCodeblock();
        return this.builder.build(tree, stream);
    }

    visitTree(tree: SynTree) {
        this.visitNode(tree);
    }


    visitNode(node: SynNode) {
        if (node instanceof AbstractSynParentElement && !this.builder.wasHandled(node)) {
            this.builder.visitChildren(node);
        }
    }

    visitStatement(element: JsStatement) {
        if (!this.builder.wasHandled(element)) {
            this.builder.with(FormattingBlock.neverExpandingBlock(), () => this.builder.visitChildren(element))
        }
    }

    visitJsCodeBlock(node: JsCodeBlock) {
        if (node.getOpeningBrace()) this.builder.advancePast(node.getOpeningBrace()!)
        this.builder.with(FormattingBlock.regular(), block => {
            if (node === this.topLevelCodeblock) {
                block.setExpanded(true);
                block.keepBlankLines();
            } else if (node.isImplicit()) {
                block.setExpanded(this.builder.isBeforeNewline()); // Always expand the toplevel codeblock
                this.builder.break(FormattingBreak.ifParentExpanded(" "));
            } else {
                block.setExpanded(true);
                block.keepBlankLines();
                this.builder.break(FormattingBreak.ifParentExpanded(""));
            }

            block.setIndent(FormattingIndent.INDENT);

            for (const statement of node.getStatements()) {
                console.log(statement);
                this.builder.visit(statement);

                const semicolon = node.getSemicolon(statement);
                if (semicolon) this.builder.advancePast(semicolon);

                this.builder.break(FormattingBreak.ifParentExpanded(""));
            }
        });
        if (node.getClosingBrace()) this.builder.advancePast(node.getClosingBrace()!);
    }
}
