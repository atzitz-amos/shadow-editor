import {Editor} from "../../Editor";
import {EditorRawData} from "./RawData";
import {LineData} from "./LineData";
import {TextRange} from "../coordinate/range/TextRange";
import {LanguageBase} from "../../../core/lang/LanguageBase";
import {DocumentInsertEvent} from "./events/DocumentInsertEvent";
import {DocumentModificationEvent} from "./events/DocumentModificationEvent";
import {DocumentDeleteEvent} from "./events/DocumentDeleteEvent";
import {WorkspaceFile} from "../../../core/workspace/filesystem/tree/WorkspaceFile";
import {TokenCache} from "../lang/TokenCache";
import {Scheduler} from "../../../core/scheduler/Scheduler";
import {GlobalState} from "../../../core/global/GlobalState";
import {DocumentSaveRequestEvent} from "./events/DocumentSaveRequestEvent";
import {EditorOpenedDocumentEvent} from "./events/EditorOpenedDocumentEvent";
import {UnsafeFlagsService} from "../../../core/sync/flags/UnsafeFlagsService";
import {UnsafeFlags} from "../../../core/sync/flags/UnsafeFlags";
import {TrackedRange} from "../coordinate/range/TrackedRange";
import {UndoRedoActionStack} from "../undo/UndoRedoActionStack";

/**
 * Represents an opened file in the editor
 * Store the language, the line-breaks, the components and the AST of a file */
export class Document {
    private editor: Editor | null = null;

    private data: EditorRawData;
    private file: WorkspaceFile | null = null;

    private lines: LineData[];
    private lineBreaks: Offset[] = [];

    private readonly tokenCache: TokenCache = new TokenCache();
    private readonly myUndoRedoStack: UndoRedoActionStack = new UndoRedoActionStack();

    private trackedRanges: WeakRef<TrackedRange>[] = []

    constructor(private caretOffset: Offset, content: string, private language: LanguageBase | null = null) {
        this.data = new EditorRawData(content);
        this.parseLines();
    }

    public getSavedCaretOffset(): Offset {
        return this.caretOffset;
    }

    public saveCaretOffset(): void {
        if (this.editor) {
            this.caretOffset = this.editor.getPrimaryCaret().getOffset();
        }
    }

    public getEditor(): Editor {
        if (!this.editor) {
            throw new Error("Document is not attached to an editor.");
        }
        return this.editor;
    }

    public isLinkedToEditor(): boolean {
        return this.editor !== null;
    }

    public linkEditor(editor: Editor | null): void {
        this.editor = editor;

        if (this.editor != null) {
            this.editor.overrideLanguage(this.language);
            this.editor.getEventBus().syncPublish(new EditorOpenedDocumentEvent(this.editor, this));
        }
    }

    public getAssociatedFile(): WorkspaceFile | null {
        return this.file;
    }

    public isAssociatedWithFile(): boolean {
        return this.getAssociatedFile() !== null;
    }

    public linkFile(file: WorkspaceFile) {
        this.file = file;
    }

    public getTokenCache(): TokenCache {
        return this.tokenCache;
    }

    public getUndoRedoStack(): UndoRedoActionStack {
        return this.myUndoRedoStack;
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

    public getFullRange(): TextRange {
        return new TextRange(0, this.getTotalDocumentLength());
    }

    public getLineStart(at: Offset): Offset {
        for (let i = 1; i < this.lineBreaks.length; i++) {
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
        return this.lines.reduce((maxLine, line) => line.getLineLength() > maxLine.getLineLength() ? line : maxLine, this.lines[0]).getLineLength();
    }

    public getLineCount(): number {
        return this.lines.length;
    }

    public getLanguage(): LanguageBase | null {
        return this.language;
    }

    public insertText(offset: Offset, text: string): void {
        this.data.insert(offset, text);

        this.updateTrackedRanges(offset, text.length);
        this.recomputeLines(offset, text, false);

        if (this.isLinkedToEditor()) {
            this.editor!.getEventBus().syncPublish(new DocumentModificationEvent(this, new TextRange(offset, offset), text, null));
            this.editor!.getEventBus().asyncPublish(new DocumentInsertEvent(this, offset, text));
        }

        this.maybeSave();
    }

    public deleteAt(at: Offset, n: number): string {
        let deleted = this.data.delete(at, n);

        this.updateTrackedRanges(at, -n);
        this.recomputeLines(at, deleted, true);

        if (this.isLinkedToEditor()) {
            let affectedRange = new TextRange(at, at + n);
            this.editor!.getEventBus().syncPublish(new DocumentModificationEvent(this, affectedRange, null, deleted));
            this.editor!.getEventBus().asyncPublish(new DocumentDeleteEvent(this, affectedRange));
        }

        this.maybeSave();
        return deleted;
    }

    public replaceRange(range: TextRange, text: string): string {
        let deleted = this.data.delete(range.start, range.getLength());
        this.recomputeLines(range.start, deleted, true);

        if (this.isLinkedToEditor()) {
            let affectedRange = new TextRange(range.start, range.end);
            this.editor!.getEventBus().syncPublish(new DocumentModificationEvent(this, affectedRange, null, deleted));
            this.editor!.getEventBus().asyncPublish(new DocumentDeleteEvent(this, affectedRange));
        }

        this.insertText(range.start, text);

        return deleted;
    }

    public substring(start: number, end?: number) {
        return this.data.substring(start, end);
    }

    public addTrackedRange(range: TrackedRange) {
        this.trackedRanges.push(new WeakRef(range));
    }

    createTracked(start: Offset, end: Offset, isGreedyLeft: boolean = false, isGreedyRight: boolean = false) {
        const range = new TrackedRange(start, end, isGreedyLeft, isGreedyRight);
        this.addTrackedRange(range);
        return range;
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

        if (deletion) {
            let newlineCount = 0;
            for (let i = 0; i < text.length; i++) {
                if (text[i] === '\n') newlineCount++;
            }

            this.lineBreaks.splice(firstIndex, newlineCount);

            for (let i = firstIndex; i < this.lineBreaks.length; i++) {
                this.lineBreaks[i] -= text.length;
            }
        } else {
            const newBreaks: number[] = [];
            for (const match of text.matchAll(/\n/g)) {
                newBreaks.push(at + match.index! + 1);
            }
            this.lineBreaks.splice(firstIndex, 0, ...newBreaks);

            for (let i = firstIndex + newBreaks.length; i < this.lineBreaks.length; i++) {
                this.lineBreaks[i] += text.length;
            }
        }

        this.lines = this.lines.slice(0, firstIndex - 1);
        for (let i = firstIndex - 1; i < this.lineBreaks.length; i++) {
            const lineStart = this.lineBreaks[i];
            const lineEnd = i + 1 < this.lineBreaks.length
                ? this.lineBreaks[i + 1] - 1
                : this.getTotalDocumentLength();
            this.lines.push(new LineData(this, i, lineStart, lineEnd));
        }
    }

    private maybeSave(): void {
        if (!this.isAssociatedWithFile()) return;
        UnsafeFlagsService.flag(UnsafeFlags.FILE_SAVE);

        Scheduler.debounce(() => {
            GlobalState.getMainEventBus().asyncPublish(new DocumentSaveRequestEvent(this, this.getAssociatedFile()!, Date.now()));
        }, 1000)
    }

    private updateTrackedRanges(offset: Offset, delta: number) {
        for (let i = 0; i < this.trackedRanges.length; i++) {
            const range = this.trackedRanges[i].deref();
            if (!range || !range.isValid()) {
                this.trackedRanges.splice(i, 1);
                i--;
                continue;
            }

            if (offset < range.getStart()) {
                range.moveBy(delta);
            } else if (offset === range.getStart()) {
                if (delta > 0 && range.isGreedyLeft())
                    range.setEnd(range.getEnd() + delta);
                else
                    range.moveBy(delta);
            } else if (offset < range.getEnd()) {
                range.setEnd(range.getEnd() + delta);
            } else if (offset === range.getEnd()) {
                if (delta > 0 && range.isGreedyRight())
                    range.setEnd(range.getEnd() + delta);
            }
        }
    }

    getTokenAt(offset: Offset) {
        return this.tokenCache.getTokenAt(offset);
    }
}