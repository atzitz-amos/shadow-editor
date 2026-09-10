import {FormattingBlock, FormattingIndent} from "../nodes/FormattingBlock";
import {FormattingEngineBase} from "./FormattingEngineBase";
import {FormattingNode} from "../nodes/FormattingNode";
import {FormattingText} from "../nodes/FormattingText";
import {FormattingSourceWhitespace} from "../nodes/FormattingSourceWhitespace";
import {FormattingSourceNewline} from "../nodes/FormattingSourceNewline";
import {FormattingBreak} from "../nodes/FormattingBreak";
import {IndentUtils} from "../../../syntax/utils/IndentUtils";
import {Token} from "../../../syntax/builder/tokens/Token";

/**
 *
 * @author Atzitz Amos
 * @date 9/9/2026
 * @since 1.0.0
 */
export abstract class SimpleLayoutFormattingEngine extends FormattingEngineBase {
    private text: string;

    private hasNewlineAtPos: boolean = true;
    private hasIndentAtPos: boolean = false;
    private lastToken: Token | null = null;
    private indentLevel: number;

    format(block: FormattingBlock): string {
        this.text = "";
        this.indentLevel = -1;
        this.formatBlock(block);
        return this.text;
    }

    abstract needsSpaceBetween(token1: Token | null, token2: Token | null): boolean;

    private formatBlock(block: FormattingBlock) {
        if (block.getIndent() === FormattingIndent.INDENT) {
            this.indentLevel++;
            console.log("entering:", this.indentLevel);
        }
        for (const child of block.getChildren()) {
            this.formatChild(child, block);
        }

        if (block.getIndent() === FormattingIndent.INDENT) {
            this.indentLevel--;
            console.log("exiting:", this.indentLevel);
        }
    }

    private formatChild(child: FormattingNode, parent: FormattingBlock) {
        if (child instanceof FormattingBlock) {
            this.formatBlock(child);
        } else if (child instanceof FormattingText) {
            if (this.hasIndentAtPos) {
                this.indent(parent);
            } else if (this.hasNewlineAtPos && this.needsSpaceBetween(this.lastToken!, child.getToken())) {
                this.text += " ";
            }
            this.text += child.getText();
            this.lastToken = child.getToken();
            this.hasNewlineAtPos = false;
            console.log("text:", child.getText());
        } else if (child instanceof FormattingSourceWhitespace) {
            this.lastToken = child.getWhitespaceToken();
            if (this.hasIndentAtPos) {
                this.indent(parent);
            } else {
                this.text += child.getWhitespaceToken()!.getValue();
            }
        } else if (child instanceof FormattingSourceNewline) {
            if (this.hasNewlineAtPos && parent.shouldKeepBlankLines()) this.text += "\n";
            this.hasNewlineAtPos = true;
        } else if (child instanceof FormattingBreak) {
            if (parent.isExpanded() || child.isForced()) {
                this.text += "\n";
                this.hasNewlineAtPos = false;
                this.hasIndentAtPos = true;
            } else {
                this.text += child.getReplacementString();
            }
        }
    }

    private formatIndentWhitespace(whitespace: FormattingSourceWhitespace, parent: FormattingBlock) {
        const size = this.manager.getIndentationSize();

        switch (parent.getIndent()) {
            case FormattingIndent.ALIGN_TO_FIRST:
                this.text += IndentUtils.makeIndentString(Math.max(this.indentLevel, Math.floor(whitespace.getLength() / size)) * size);
                break;
            default:
                this.text += IndentUtils.makeIndentString(this.indentLevel * size);
                break;
        }
    }

    private indent(parent: FormattingBlock) {
        this.text += IndentUtils.makeIndentString(this.indentLevel * this.manager.getIndentationSize());
        console.log("indenting:", this.indentLevel);
        this.hasIndentAtPos = false;
    }
}
