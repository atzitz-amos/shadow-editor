import {ProjectFile} from "../../project/File";
import {Editor} from "../../Editor";
import {EditorRawData} from "./EditorRawData";
import {LineData} from "./LineData";
import {SRTree} from "../lang/parser/SRTree";
import {AbstractVisualEventListener} from "../events/events";
import {TextContext, TextRange, TextRangeManager} from "../coordinate/TextRange";

/**
 * Represents an opened file in the editor
 * Store the language, the line-breaks, the components and the AST of a file */
export class Document {
    private readonly language: string;

    private data: EditorRawData;
    private srTree: SRTree;

    private lines: LineData[];
    private lineBreaks: Offset[] = [];

    constructor(private editor: Editor, private file: ProjectFile) {
        this.language = file.type;

        this.data = new EditorRawData(file.getContentAsString());
        this.parseLines();

        this.editor.addVisualEventListener(new class extends AbstractVisualEventListener {
            onAttached(editor: Editor, root: HTMLElement) {
                editor.getOpenedDocument().loadSRTree(editor);
            }
        });
    }

    public getTextContent(): string {
        return this.data.toString();
    }

    public getCharAt(offset: Offset) {
        return this.data.index(offset);
    }

    public getTextBetween(start: number, end: number): string {
        return this.data.substring(start, end);
    }

    public getWordAt(at: Offset, sep: RegExp): TextRange {
        let line = this.getLineAt(at);
        let lineBegin = line.getStart();

        at -= lineBegin; // Adjust `at` to be relative to the line

        function isMatch(ch: string): boolean {
            sep.lastIndex = 0;
            return sep.test(ch);
        }

        // Find left delimiter
        let start = -1;
        for (let i = at; i >= 0; i--) {
            if (isMatch(line.charAt(i))) {
                start = i;
                break;
            }
        }

        // Find right delimiter
        let end = -1;
        for (let i = at; i < line.getLineLength(); i++) {
            if (isMatch(line.charAt(i))) {
                end = i;
                break;
            }
        }

        start = start === -1 ? 0 : start + 1; // If no left delimiter, start at 0
        if (end === -1) {
            end = line.getLineLength(); // If no right delimiter, end at the end of the line
        }
        return new TextRange(start + lineBegin, end + lineBegin); // Return the range between the delimiters
    }

    public getTotalDocumentLength(): number {
        return this.data.length();
    }

    public getLineData(line: number): LineData {
        return this.lines[line];
    }

    public getLineStart(at: Offset): Offset {
        for (let i = 0; i < this.lineBreaks.length; i++) {
            if (this.lineBreaks[i] > at) {
                return this.lineBreaks[i - 1];
            }
        }
        return this.lineBreaks[this.lineBreaks.length - 1];
    }

    public getLineEnd(at: Offset) {
        for (let i = 0; i < this.lineBreaks.length; i++) {
            if (this.lineBreaks[i] > at) {
                return this.lineBreaks[i] - 1;
            }
        }
        return this.getTotalDocumentLength();
    }

    public getLineAt(offset: Offset): LineData {
        for (let i = 0; i < this.lineBreaks.length; i++) {
            if (this.lineBreaks[i] > offset) {
                return this.lines[i - 1];
            }
        }
        return this.lines[this.lines.length - 1];
    }

    public getLineBetween(from: int, to: int): LineData[] {
        return this.lines.slice(from, to);
    }

    public getLineLength(lineno: int) {
        return this.lines[lineno].getLineLength();
    }

    public getMaxLengthLine() {
        return Math.max(...this.lines.map(l => l.getLineLength()));
    }

    public getLineCount(): number {
        return this.lines.length;
    }

    public getLanguage(): string {
        return this.language;
    }

    public getSrTree(): SRTree {
        return this.srTree;
    }

    public insertText(offset: Offset, text: string): void {
        this.data.insert(offset, text);

        this.recomputeLines(offset, text, false);
        TextRangeManager.getInstance().updateRanges(offset, text.length);
    }

    public deleteAt(at: Offset, n: number): string {
        let deleted = this.data.delete(at, n);

        this.recomputeLines(at, deleted, true);
        TextRangeManager.getInstance().updateRanges(at, -n);

        return deleted;
    }

    public getAssociatedContext(at: Offset): TextContext {
        let scope = this.srTree.scoping.toplevel(); // TODO: this.srTree.scoping.getScopeAt(at);
        return {
            begin: scope.range.begin,
            end: scope.range.end,
            text: this.data.getTextInRange(scope.range),
            scope: scope,
            containingNode: this.srTree.getContainingNodeAt(at)
        }
    }

    private loadSRTree(editor: Editor) {
        this.srTree = new SRTree(
            editor.getParserForFileType(this.language),
            editor.getLexerForFileType(this.language).asTokenStream(this.getTextContent())
        );
    }

    private parseLines(): void {
        this.lines = [];
        this.lineBreaks = [0];

        let textContent = this.getTextContent();

        for (let i = 0; i < textContent.length; i++) {
            if (textContent[i] === "\n") {
                this.lineBreaks.push(i + 1);
            }
        }
        for (let i = 0; i < this.lineBreaks.length; i++) {
            let lineStart = this.lineBreaks[i];
            let lineEnd = (i + 1 < this.lineBreaks.length) ? this.lineBreaks[i + 1] - 1 : this.getTotalDocumentLength();
            this.lines.push(new LineData(this, i, lineStart, lineEnd));

        }
    }

    private recomputeLines(at: Offset, text: string, deletion: boolean = false): void {
        let firstIndex = this.getLineAt(at).getLineNumber() + 1;
        if (firstIndex > this.getLineCount()) firstIndex = this.lineBreaks.length;

        let addedLines = 0;

        for (const match of text.matchAll(/\n/g)) {
            if (deletion) {
                this.lines.splice(this.lineBreaks.indexOf(at + match.index! + 1), 1);
                this.lineBreaks.splice(this.lineBreaks.indexOf(at + match.index! + 1), 1);
            } else {
                let lineBreakOffset = at + match.index! + 1;
                this.lineBreaks.splice(firstIndex + addedLines, 0, lineBreakOffset);
                addedLines++;
            }
        }

        for (let i = firstIndex + addedLines; i < this.lineBreaks.length; i++) {
            this.lineBreaks[i] += (deletion ? -text.length : text.length);
        }

        this.lines = this.lines.slice(0, firstIndex - 1);
        for (let i = firstIndex - 1; i < this.lineBreaks.length; i++) {
            let lineStart = this.lineBreaks[i];
            let lineEnd = (i + 1 < this.lineBreaks.length) ? this.lineBreaks[i + 1] - 1 : this.getTotalDocumentLength();
            this.lines.push(new LineData(this, i, lineStart, lineEnd));
        }
    }
}