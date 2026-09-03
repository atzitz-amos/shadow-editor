import {Document} from "../Document";
import {IndentUtils} from "../../../../lang/syntax/utils/IndentUtils";
import {Arrays} from "../../../utils/Arrays";

/**
 *
 * @author Atzitz Amos
 * @date 9/3/2026
 * @since 1.0.0
 */
export class IndentedCodeModification {
    private alignIndent: number;

    constructor(private readonly document: Document, private readonly startLine: number, private readonly endLine: number) {
        this.alignIndent = Math.min(...Arrays.rangeInclusive(startLine, endLine).map(lineNo => document.getLineData(lineNo).getIndentationSize()));
        console.log(this.alignIndent);
    }

    getAlignIndent(): number {
        return this.alignIndent;
    }

    setAlignIndent(indent: number) {
        this.alignIndent = indent;
    }

    public alignAll(): void {
        for (let lineNo = this.startLine; lineNo <= this.endLine; lineNo++) {
            this.align(lineNo);
        }
    }

    public align(lineNo: number) {
        const line = this.document.getLineData(lineNo);
        const indent = line.getIndentationSize();
        if (indent < this.alignIndent) {
            const diff = this.alignIndent - indent;
            this.document.insertText(line.getStart(), IndentUtils.makeIndentString(diff));
        } else if (indent > this.alignIndent) {
            const diff = indent - this.alignIndent;
            this.document.deleteAt(line.getStart(), diff);
        }
    }

    public getIndent(lineNo: number) {
        return this.document.getLineData(lineNo).getIndentationSize();
    }

    public insertAtStartAndAlign(modifier: (line: string, lineNo: number) => string) {
        for (let lineNo = this.startLine; lineNo <= this.endLine; lineNo++) {
            const line = this.document.getLineData(lineNo);
            const text = line.getText();
            const indent = line.getIndentationSize();
            const stripped = text.substring(indent);

            const modified = modifier(stripped, lineNo);
            const aligned = IndentUtils.indent(modified, this.alignIndent, 1);

            this.document.deleteAt(line.getStart(), indent);
            this.document.insertText(line.getStart(), aligned);
        }
    }

    public insertAtStartAndKeep(modifier: (line: string, lineNo: number) => string) {
        for (let lineNo = this.startLine; lineNo <= this.endLine; lineNo++) {
            const line = this.document.getLineData(lineNo);
            const text = line.getText();
            const indent = line.getIndentationSize();
            const stripped = text.substring(indent);

            this.document.insertText(line.getStart() + indent, modifier(stripped, lineNo));
        }
    }

    public replaceLineAndAlign(modifier: (line: string, lineNo: number) => string) {
        for (let lineNo = this.startLine; lineNo <= this.endLine; lineNo++) {
            const line = this.document.getLineData(lineNo);
            const text = line.getText();
            const indent = line.getIndentationSize();
            const stripped = text.substring(indent);

            const modified = modifier(stripped, lineNo);
            const aligned = IndentUtils.indent(modified, this.alignIndent);

            this.document.deleteAt(line.getStart(), text.length);
            this.document.insertText(line.getStart(), aligned);
        }
    }

    public replaceLineAndKeep(modifier: (line: string, lineNo: number) => string) {
        for (let lineNo = this.startLine; lineNo <= this.endLine; lineNo++) {
            const line = this.document.getLineData(lineNo);
            const text = line.getText();
            const indent = line.getIndentationSize();
            const stripped = text.substring(indent);

            const modified = modifier(stripped, lineNo);

            this.document.deleteAt(line.getStart() + indent, stripped.length);
            this.document.insertText(line.getStart() + indent, modified);
        }
    }

    public deleteAtStartAndAlign(deleter: (line: string, lineNo: number) => number) {
        for (let lineNo = this.startLine; lineNo <= this.endLine; lineNo++) {
            const line = this.document.getLineData(lineNo);
            const text = line.getText();
            const indent = line.getIndentationSize();
            const stripped = text.substring(indent);

            const deleteCount = deleter(stripped, lineNo);
            this.document.deleteAt(line.getStart(), deleteCount + indent);
            this.document.insertText(line.getStart(), IndentUtils.makeIndentString(this.alignIndent));
        }
    }

    public deleteAtStartAndKeep(deleter: (line: string, lineNo: number) => number) {
        for (let lineNo = this.startLine; lineNo <= this.endLine; lineNo++) {
            const line = this.document.getLineData(lineNo);
            const text = line.getText();
            const indent = line.getIndentationSize();
            const stripped = text.substring(indent);

            const deleteCount = deleter(stripped, lineNo);
            this.document.deleteAt(line.getStart() + indent, deleteCount);
        }
    }

    public all(condition: (line: string, lineNo: number) => boolean) {
        for (let lineNo = this.startLine; lineNo <= this.endLine; lineNo++) {
            const line = this.document.getLineData(lineNo);
            const text = line.getText();
            const indent = line.getIndentationSize();
            const stripped = text.substring(indent);

            if (!condition(stripped, lineNo)) {
                return false;
            }
        }
        return true;
    }

    public any(condition: (line: string, lineNo: number) => boolean) {
        for (let lineNo = this.startLine; lineNo <= this.endLine; lineNo++) {
            const line = this.document.getLineData(lineNo);
            const text = line.getText();
            const indent = line.getIndentationSize();
            const stripped = text.substring(indent);

            if (condition(stripped, lineNo)) {
                return true;
            }
        }
        return false;
    }
}
