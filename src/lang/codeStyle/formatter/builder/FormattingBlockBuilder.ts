import {SynTree} from "../../../syntax/api/tree/SynTree";
import {Token} from "../../../syntax/builder/tokens/Token";
import {CodeStyleManager} from "../../manager/CodeStyleManager";
import {TokenStream} from "../../../syntax/builder/tokens/TokenStream";
import {FormattingBlock} from "../nodes/FormattingBlock";
import {SynNode} from "../../../syntax/api/SynNode";
import {FormattingBreak} from "../nodes/FormattingBreak";
import {SynNodeVisitor} from "../../../syntax/visitors/SynNodeVisitor";
import {AbstractSynParentElement} from "../../../syntax/impl/tree/AbstractSynParentElement";
import {SynParentElement} from "../../../syntax/api/tree/SynParentElement";
import {SynTokenNode} from "../../../syntax/impl/SynTokenNode";
import {FormattingSourceWhitespace} from "../nodes/FormattingSourceWhitespace";
import {FormattingSourceNewline} from "../nodes/FormattingSourceNewline";
import {FormattingText} from "../nodes/FormattingText";

/**
 *
 * @author Atzitz Amos
 * @date 9/4/2026
 * @since 1.0.0
 */
export class FormattingBlockBuilder {
    private stream: TokenStream;

    private readonly blocks: FormattingBlock[] = [FormattingBlock.neverExpandingBlock().keepBlankLines()];

    constructor(private readonly manager: CodeStyleManager, private readonly visitor: SynNodeVisitor) {
    }

    get currentBlock() {
        return this.blocks[this.blocks.length - 1];
    }

    build(tree: SynTree, stream: TokenStream) {
        this.stream = stream;

        tree.accept(this.visitor);
        return this.currentBlock;
    }

    getOffset() {
        return this.stream.seek()?.getRange().getStart() ?? this.stream.seekPrevious()?.getRange().getEnd() ?? 0;
    }

    isWhitespace(token: Token | null): token is Token {
        return this.manager.getWhitespaceTokenGroup().includes(token?.getType()!);
    }

    isNewline(token: Token | null): token is Token {
        return this.manager.getNewlineTokenGroup().includes(token?.getType()!);
    }

    wasHandled(node: SynNode) {
        const offset = this.getOffset();
        return offset > node.getTextRange().getStart();
    }

    visitChildren(node: SynParentElement) {
        for (const child of node.getChildren()) {
            this.visit(child);
        }
    }

    visit(node: SynNode) {
        if (node instanceof SynTokenNode) {
            this.advancePast(node.token);
        } else if (node instanceof AbstractSynParentElement) {
            if (this.getOffset() > node.getTextRange().start && this.getOffset() < node.getTextRange().end) {
                console.error("Fatal: Cannot visit node:", node, "\n\tRange =", node.getTextRange(), "\n\t Offset =", this.getOffset());
                throw new Error("Impossible to visit node:" + node.constructor.name + ", node was already partially handled.");
            } else if (this.wasHandled(node)) return console.warn("Duplicate visit of node:", node);
            this.advanceUntil(node.getTextRange().start);
            node.accept(this.visitor);
        }
    }

    advancePast(token: Token | SynTokenNode) {
        if (token instanceof SynTokenNode) token = token.token;
        this.advanceUntil(token.getRange().getEnd());
    }

    advanceUntil(offset: Offset, add: boolean = true) {
        let next: Token | null;
        while ((next = this.stream.seek()) && next.getRange().end <= offset) {
            const previous = this.stream.seekPrevious();
            const token = this.stream.consume();
            if (!add) continue;
            if (this.isWhitespace(token)) {
                this.addWhitespace(token, previous);
            } else if (this.isNewline(token)) {
                this.addNewline(token);
            } else if (token) {
                this.addText(token, previous);
            }
        }
    }

    break(formattingBreak: FormattingBreak) {
        this.currentBlock.addChild(formattingBreak);
    }

    with(block: FormattingBlock, callback: (block: FormattingBlock) => void) {
        this.currentBlock.addChild(block);
        this.blocks.push(block);
        block.setStart(this.getOffset())

        callback(block);

        this.blocks.pop();
        block.setEnd(this.getOffset());
    }

    isBeforeNewline() {
        return this.isNewline(this.stream.seek()!);
    }

    private addWhitespace(whitespace: Token, previous: Token | null) {
        const isIndentation = this.isNewline(previous);
        if (!isIndentation) this.currentBlock.addChild(new FormattingSourceWhitespace(whitespace, isIndentation))
    }

    private addNewline(newline: Token) {
        this.currentBlock.addChild(new FormattingSourceNewline(newline))
    }

    private addText(token: Token, previous: Token | null) {
        this.currentBlock.addChild(new FormattingText(token));
    }
}