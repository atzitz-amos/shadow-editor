import {FormattingNode} from "./FormattingNode";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";

/**
 *
 * @author Atzitz Amos
 * @date 9/4/2026
 * @since 1.0.0
 */
export class FormattingBlock extends FormattingNode {
    private expanded: boolean = true;
    private _keepBlankLines: boolean = false;

    private forceExpanded: boolean = false;
    private neverExpanded: boolean = false;

    private startOffset: number;
    private endOffset: number;

    private indent: FormattingIndent = FormattingIndent.NONE;

    private readonly children: FormattingNode[] = [];


    constructor() {
        super();
    }

    static neverExpandingBlock(indent: FormattingIndent = FormattingIndent.NONE) {
        const block = new FormattingBlock();
        block.neverExpand();
        return block;
    }

    static regular(indent: FormattingIndent = FormattingIndent.NONE) {
        return new FormattingBlock();
    }

    public keepBlankLines() {
        this._keepBlankLines = true;
        return this;
    }

    public getChildren(): FormattingNode[] {
        return this.children;
    }

    public addChild(child: FormattingNode) {
        this.children.push(child);
    }

    public forceExpand() {
        this.forceExpanded = true;
        this.expanded = true;
        return this;
    }

    public neverExpand() {
        this.neverExpanded = true;
        this.expanded = false;
        return this;
    }

    public setExpanded(value: boolean) {
        if (value && this.neverExpanded || !value && this.forceExpanded) return;
        this.expanded = value;
    }

    public isExpanded(): boolean {
        return this.expanded;
    }

    public shouldKeepBlankLines() {
        return this._keepBlankLines;
    }

    setStart(offset: Offset) {
        this.startOffset = offset;
    }

    setEnd(offset: Offset) {
        this.endOffset = offset;
    }

    setIndent(indent: FormattingIndent) {
        this.indent = indent;
    }

    getIndent(): FormattingIndent {
        return this.indent;
    }

    getRange(): TextRange {
        return new TextRange(this.startOffset, this.endOffset);
    }

    isForceExpanding() {
        return this.forceExpanded;
    }

    isNeverExpanding() {
        return this.neverExpanded;
    }
}

export enum FormattingIndent {
    NONE, ALIGN, INDENT, ALIGN_TO_FIRST
}