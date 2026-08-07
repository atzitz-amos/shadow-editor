import {IBehaviorContext} from "./IBehaviorContext";
import {Editor} from "../../../Editor";
import {Caret} from "../../caret/Caret";
import {SelectionModel} from "../../caret/Selection";
import {LogicalPosition} from "../../coordinate/LogicalPosition";
import {VisualPosition} from "../../coordinate/VisualPosition";
import {Token} from "../../../../lang/syntax/builder/tokens/Token";
import {LineData} from "../../document/LineData";

/**
 *
 * @author Atzitz Amos
 * @date 6/22/2026
 * @since 1.0.0
 */
export class EditorBehaviorContext implements IBehaviorContext {
    private line: LineData | null = null;

    private readonly leadingChar: string | null;
    private readonly trailingChar: string | null;

    private readonly tokenAt: Token | null;

    constructor(private readonly editor: Editor, private readonly caret: Caret) {
        const document = this.editor.getOpenedDocument();
        const offset = this.caret.getOffset();

        if (offset <= 0) this.leadingChar = null;
        else this.leadingChar = document.getTextBetween(offset - 1, offset);

        if (offset >= document.getTotalDocumentLength()) this.trailingChar = null;
        else this.trailingChar = document.getTextBetween(offset, offset + 1);

        this.tokenAt = document.getTokenAt(offset);
    }

    getEditor(): Editor {
        return this.editor;
    }

    getCaret(): Caret {
        return this.caret;
    }

    hasSelectionActive(): boolean {
        return this.caret.getSelectionModel().isSelectionActive;
    }

    getSelectionText(): string | null {
        return this.caret.getSelectedText();
    }

    getSelection(): SelectionModel {
        return this.caret.getSelectionModel();
    }

    getCaretOffset(): Offset {
        return this.caret.getOffset();
    }

    getCaretLogicalPosition(): LogicalPosition {
        return this.caret.getLogical();
    }

    getCaretVisualPosition(): VisualPosition {
        return this.caret.getVisual();
    }

    getLeadingChar(): string | null {
        return this.leadingChar;
    }

    getTrailingChar(): string | null {
        return this.trailingChar;
    }

    getTokenAtCaret(): Token | null {
        return this.tokenAt;
    }

    getLineData(): LineData {
        if (!this.line) {
            this.line = this.editor.getOpenedDocument().getLineAt(this.getCaretOffset());
        }
        return this.line;
    }
}
