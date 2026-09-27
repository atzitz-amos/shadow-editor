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
import {JsObjectLiteral} from "../../lang/syntax/literal/JsObjectLiteral";
import {JsClassBody} from "../../lang/syntax/objects/JsClassBody";

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
                this.builder.visit(statement);

                const semicolon = statement.getSemicolon();
                if (semicolon) this.builder.advancePast(semicolon);

                this.builder.break(FormattingBreak.ifParentExpanded(""));
            }
        });
        if (node.getClosingBrace()) this.builder.advancePast(node.getClosingBrace()!);
    }

    visitObjectLiteral(element: JsObjectLiteral) {
        this.builder.advancePast(element.getOpeningBrace());
        this.builder.with(FormattingBlock.regular(), block => {
            block.setExpanded(this.builder.isBeforeNewline());
            block.keepBlankLines();
            this.builder.break(FormattingBreak.ifParentExpanded(""));
            block.setIndent(FormattingIndent.INDENT);

            for (const [key, value] of element.getProperties()) {
                this.builder.with(FormattingBlock.regular(), () => {
                    this.builder.visit(key);
                    if (value) this.builder.visit(value);
                });

                const comma = element.getComma(key);
                if (comma) this.builder.advancePast(comma);

                this.builder.break(FormattingBreak.ifParentExpanded(" "));
            }
        });
        this.builder.advancePast(element.getClosingBrace());
    }

    visitClassBody(element: JsClassBody) {
        this.builder.advancePast(element.getOpeningBrace()!);
        this.builder.with(FormattingBlock.alwaysExpandingBlock(), block => {
            block.keepBlankLines();
            this.builder.break(FormattingBreak.forced());
            block.setIndent(FormattingIndent.INDENT);

            const members = element.getMembers();
            for (let i = 0; i < members.length; i++) {
                const member = members[i];
                this.builder.visit(member);
                this.builder.break(FormattingBreak.forced());
                if (i !== members.length - 1) {
                    this.builder.break(FormattingBreak.forced());
                }
            }
        });
        this.builder.advancePast(element.getClosingBrace()!);
    }
}
