import {UIComponent} from "../../engine/components/UIComponent";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {SimpleDiff} from "../../../diff/simple/SimpleDiff";
import {DiffChange} from "../../../diff/simple/DiffChange";
import {DiffResult} from "../../../diff/simple/DiffResult";

export type IdeSideBySideDiffOptions = {
    oldTitle?: string,
    newTitle?: string,
    /** Unchanged lines kept around each change when folding. Defaults to 3 */
    context?: number,
    /** Folds long runs of unchanged lines into an expandable row. Defaults to true */
    foldUnchanged?: boolean,
    /** Compares lines without their leading and trailing whitespace */
    ignoreWhitespace?: boolean
}

type CellKind = "equal" | "deleted" | "inserted";

type Cell = {
    line: number,
    text: string,
    kind: CellKind
}

/** A line of the view: one cell per side, null where the other side has lines this one does not */
type Row = {
    left: Cell | null,
    right: Cell | null
}

/** Consecutive rows, either all unchanged or all changed */
type Segment = {
    changed: boolean,
    rows: Row[]
}

/**
 * Two texts side by side, aligned line by line, with the deleted and inserted lines highlighted.
 * <p>
 * Each side scrolls horizontally on its own, while vertical scrolling is shared so that the lines stay aligned:
 * every line has the same height, as lines are never wrapped.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class IdeSideBySideDiff extends UIComponent {
    private result: DiffResult<string>;

    constructor(private oldText: string, private newText: string, private readonly options: IdeSideBySideDiffOptions = {}) {
        super(HTMLUtils.createDiv("ide-diff"));
        this.result = this.compute();
    }

    setTexts(oldText: string, newText: string): void {
        this.oldText = oldText;
        this.newText = newText;
        this.result = this.compute();
        this.redraw();
    }

    getResult(): DiffResult<string> {
        return this.result;
    }

    draw(): void {
        const root = this.getUnderlyingElement();
        root.innerHTML = "";

        this.renderHeader(HTMLUtils.createDiv("ide-diff-header", root));

        const panes = HTMLUtils.createDiv("ide-diff-panes", root);
        const left = HTMLUtils.createDiv("ide-diff-lines", HTMLUtils.createDiv("ide-diff-pane", panes));
        const right = HTMLUtils.createDiv("ide-diff-lines", HTMLUtils.createDiv("ide-diff-pane", panes));
        IdeSideBySideDiff.syncVerticalScroll(left.parentElement!, right.parentElement!);

        const addRows = (rows: Row[]) => rows.forEach(row => {
            left.appendChild(IdeSideBySideDiff.renderLine(row.left));
            right.appendChild(IdeSideBySideDiff.renderLine(row.right));
        });

        const segments = IdeSideBySideDiff.toSegments(this.result.getChanges());
        const fold = (this.options.foldUnchanged ?? true) && !this.result.isIdentical();
        const context = this.options.context ?? 3;

        segments.forEach((segment, i) => {
            // Keep the context next to the changes before and after, fold what is in between
            const keepStart = i === 0 ? 0 : context;
            const keepEnd = i === segments.length - 1 ? 0 : context;
            const hidden = segment.rows.length - keepStart - keepEnd;

            if (segment.changed || !fold || hidden < 2) {
                addRows(segment.rows);
                return;
            }

            addRows(segment.rows.slice(0, keepStart));
            IdeSideBySideDiff.addFold(left, right, segment.rows.slice(keepStart, keepStart + hidden));
            addRows(segment.rows.slice(keepStart + hidden));
        });
    }

    private compute(): DiffResult<string> {
        return SimpleDiff.diffLines(this.oldText, this.newText, {ignoreWhitespace: this.options.ignoreWhitespace});
    }

    private renderHeader(header: HTMLElement) {
        HTMLUtils.createElement("span.ide-diff-title", header).textContent = this.options.oldTitle ?? "Before";

        const right = HTMLUtils.createDiv("ide-diff-title-row", header);
        HTMLUtils.createElement("span.ide-diff-title", right).textContent = this.options.newTitle ?? "After";

        const stats = HTMLUtils.createElement("span.ide-diff-stats", right);
        if (this.result.isIdentical()) {
            HTMLUtils.createElement("span.ide-diff-identical", stats).textContent = "identical";
        } else {
            HTMLUtils.createElement("span.ide-diff-stat-inserted", stats).textContent = `+${this.result.getInsertedCount()}`;
            HTMLUtils.createElement("span.ide-diff-stat-deleted", stats).textContent = `−${this.result.getDeletedCount()}`;
        }
    }

    /** Scrolling one side vertically scrolls the other one along */
    private static syncVerticalScroll(a: HTMLElement, b: HTMLElement) {
        const follow = (source: HTMLElement, target: HTMLElement) => () => {
            if (target.scrollTop !== source.scrollTop) target.scrollTop = source.scrollTop;
        };
        a.addEventListener("scroll", follow(a, b), {passive: true});
        b.addEventListener("scroll", follow(b, a), {passive: true});
    }

    /**
     * Turns the changes into aligned rows. A deletion followed by an insertion is a modification: its lines are
     * put face to face.
     */
    private static toSegments(changes: readonly DiffChange<string>[]): Segment[] {
        const segments: Segment[] = [];
        const cell = (change: DiffChange<string>, i: number, kind: CellKind): Cell => ({
            line: (kind === "inserted" ? change.newIndex : change.oldIndex) + i + 1,
            text: change.items[i],
            kind
        });

        for (let i = 0; i < changes.length; i++) {
            const change = changes[i];

            if (change.type === "equal") {
                segments.push({
                    changed: false,
                    rows: change.items.map((text, j) => ({
                        left: {line: change.oldIndex + j + 1, text, kind: "equal"},
                        right: {line: change.newIndex + j + 1, text, kind: "equal"}
                    }))
                });
                continue;
            }

            const deleted = change.type === "delete" ? change : null;
            const inserted = change.type === "insert" ? change : changes[i + 1]?.type === "insert" ? changes[++i] : null;

            const length = Math.max(deleted?.items.length ?? 0, inserted?.items.length ?? 0);
            const rows: Row[] = [];
            for (let j = 0; j < length; j++) {
                rows.push({
                    left: deleted && j < deleted.items.length ? cell(deleted, j, "deleted") : null,
                    right: inserted && j < inserted.items.length ? cell(inserted, j, "inserted") : null
                });
            }
            segments.push({changed: true, rows});
        }
        return segments;
    }

    private static renderLine(cell: Cell | null): HTMLElement {
        const line = HTMLUtils.createDiv("ide-diff-line");
        const number = HTMLUtils.createElement("span.ide-diff-line-number", line);
        const text = HTMLUtils.createElement("span.ide-diff-text", line);

        if (cell === null) {
            line.classList.add("empty");
            return line;
        }

        line.classList.add(cell.kind);
        number.textContent = String(cell.line);
        text.textContent = cell.text;
        return line;
    }

    /**
     * Adds a row standing for unchanged lines on both sides. Clicking either replaces both by the lines.
     */
    private static addFold(left: HTMLElement, right: HTMLElement, rows: Row[]) {
        const create = (label: boolean) => {
            const fold = HTMLUtils.createDiv("ide-diff-fold");
            if (label) {
                fold.innerHTML = `<i class="fa-solid fa-up-down"></i>`;
                fold.append(`${rows.length} unchanged lines`);
            }
            fold.title = "Show the unchanged lines";
            return fold;
        };

        const leftFold = left.appendChild(create(true));
        const rightFold = right.appendChild(create(false));
        const expand = () => {
            leftFold.replaceWith(...rows.map(row => IdeSideBySideDiff.renderLine(row.left)));
            rightFold.replaceWith(...rows.map(row => IdeSideBySideDiff.renderLine(row.right)));
        };
        leftFold.addEventListener("click", expand);
        rightFold.addEventListener("click", expand);
    }
}
