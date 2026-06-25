import {IBehaviorContext} from "./IBehaviorContext";
import {Editor} from "../../../Editor";
import {Caret} from "../../caret/Caret";
import {SelectionModel} from "../../caret/Selection";
import {LogicalPosition} from "../../coordinate/LogicalPosition";
import {VisualPosition} from "../../coordinate/VisualPosition";

/**
 *
 * @author Atzitz Amos
 * @date 6/22/2026
 * @since 1.0.0
 */
export class EditorBehaviorContext implements IBehaviorContext {
    constructor(private readonly editor: Editor, private readonly caret: Caret) {
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

    getTrailingChar(): string | null {
        const document = this.editor.getOpenedDocument();
        const offset = this.caret.getOffset();
        if (offset >= document.getTotalDocumentLength()) return null;
        return document.getTextBetween(offset, offset + 1);
    }

    getLeadingChar(): string | null {
        const document = this.editor.getOpenedDocument();
        const offset = this.caret.getOffset();
        if (offset <= 0) return null;
        return document.getTextBetween(offset - 1, offset);
    }
}
