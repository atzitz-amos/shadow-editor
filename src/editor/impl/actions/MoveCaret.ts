import {AbstractAction} from "../../../core/actions/AbstractAction";
import {Key, ModifierKeyHolder} from "../../../core/keybinds/Keybind";
import {SelectionDirection} from "../../core/caret/Selection";
import {Caret, CaretMovementFlags} from "../../core/caret/Caret";

import {LogicalPosition} from "../../core/coordinate/LogicalPosition";
import {CtrlMoveHelper} from "./utils/CtrlMoveHelper";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";


function handleClearSelection(caret: Caret, shouldMove: boolean) {
    let start = caret.selectionModel.getOrigin();
    caret.selectionModel.clear();
    if (shouldMove) {
        caret.moveToOffset(start!);
    }
}

export class MoveCaretLeftAction extends AbstractAction {
    getName(): string {
        return 'MoveCaretLeft';
    }

    getDescription(): string {
        return 'Move the caret to the left by one character.';
    }

    getDefaultKeybinding() {
        return {
            key: Key.ARROW_LEFT,
            ctrl: false,
            alt: false,
        };
    }

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        editor.getCaretModel().forEachCaret(caret => {
            let selectionDirection = caret.selectionModel.getDirection();
            if (!ctx.getEvent().shiftKey && selectionDirection !== SelectionDirection.UNKNOWN) {
                handleClearSelection(caret, selectionDirection === SelectionDirection.RIGHT);
            } else {
                caret.shiftLeft(ModifierKeyHolder.isShiftPressed() ? CaretMovementFlags.IGNORE_INLAYS : CaretMovementFlags.DEFAULT);
            }
        });

        editor.getView().resetBlink();
    }

}

export class MoveCaretRightAction extends AbstractAction {
    getName(): string {
        return 'MoveCaretRight';
    }

    getDescription(): string {
        return 'Move the caret to the right by one character.';
    }

    getDefaultKeybinding() {
        return {
            key: Key.ARROW_RIGHT,
            ctrl: false,
            alt: false,
        };
    }

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        editor.getCaretModel().forEachCaret(caret => {
            let selectionDirection = caret.selectionModel.getDirection();
            if (!ctx.getEvent().shiftKey && selectionDirection !== SelectionDirection.UNKNOWN) {
                handleClearSelection(caret, selectionDirection === SelectionDirection.LEFT);
            } else {
                caret.shiftRight(ModifierKeyHolder.isShiftPressed() ? CaretMovementFlags.IGNORE_INLAYS : CaretMovementFlags.DEFAULT);
            }
        });
        editor.getView().resetBlink();
    }

}

export class MoveCaretUpAction extends AbstractAction {
    getName(): string {
        return 'MoveCaretUp';
    }

    getDescription(): string {
        return 'Move the caret up one line.';
    }

    getDefaultKeybinding() {
        return {
            key: Key.ARROW_UP,
            ctrl: false,
            alt: false,
        };
    }

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        editor.getView().resetBlink();
        editor.getCaretModel().forEachCaret(caret => {
            if (!ctx.getEvent().shiftKey && caret.selectionModel.getDirection() !== SelectionDirection.UNKNOWN) {
                handleClearSelection(caret, caret.selectionModel.getDirection() === SelectionDirection.RIGHT);
            }

            let caretPos = caret.getLogical();

            if (caretPos.row === 0) return;

            caret.setVertMovementPos();
            let pos = new LogicalPosition(
                Math.min(editor.getOpenedDocument().getLineLength(caretPos.row - 1), caret.myVertMovementPos),
                caretPos.row - 1
            )
            caret.moveToLogical(pos);
        });
    }

}

export class MoveCaretDownAction extends AbstractAction {
    getName(): string {
        return 'MoveCaretDown';
    }

    getDescription(): string {
        return 'Move the caret down one line.';
    }

    getDefaultKeybinding() {
        return {
            key: Key.ARROW_DOWN,
            ctrl: false,
            alt: false,
        };
    }

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        editor.getView().resetBlink();
        editor.getCaretModel().forEachCaret(caret => {
            if (!ctx.getEvent().shiftKey && caret.selectionModel.getDirection() !== SelectionDirection.UNKNOWN) {
                handleClearSelection(caret, caret.selectionModel.getDirection() === SelectionDirection.LEFT);
            }

            let caretPos = caret.getLogical();

            if (caretPos.row >= editor.getLineCount() - 1) return;

            caret.setVertMovementPos();
            let pos = new LogicalPosition(
                Math.min(editor.getOpenedDocument().getLineLength(caretPos.row + 1), caret.myVertMovementPos),
                caretPos.row + 1
            )
            caret.moveToLogical(pos);
        });
    }
}

export class MoveCaretToStartAction extends AbstractAction {
    getName(): string {
        return 'MoveCaretToStart';
    }

    getDescription(): string {
        return 'Move the caret to the start of the line.';
    }

    getDefaultKeybinding() {
        return {
            key: Key.HOME,
            ctrl: false,
            alt: false
        };
    }

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        editor.getView().resetBlink();
        editor.getCaretModel().forEachCaret(caret => {
            caret.myVertMovementPos = 0;
            caret.moveToLogical(new LogicalPosition(0, caret.getLogical().row));
        });
    }
}

export class MoveCaretToEndAction extends AbstractAction {
    getName(): string {
        return 'MoveCaretToEnd';
    }

    getDescription(): string {
        return 'Move the caret to the end of the line.';
    }

    getDefaultKeybinding() {
        return {
            key: Key.END,
            ctrl: false,
            alt: false
        };
    }

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        editor.getView().resetBlink();
        editor.getCaretModel().forEachCaret(caret => {
            let lineLength = editor.getOpenedDocument().getLineLength(caret.getLogical().row);
            caret.myVertMovementPos = lineLength;
            caret.moveToLogical(new LogicalPosition(
                lineLength,
                caret.getLogical().row
            ));
        });
    }
}

export class CtrlMoveCaretLeftAction extends AbstractAction {
    getName(): string {
        return 'CtrlMoveCaretLeft';
    }

    getDescription(): string {
        return 'Move the caret to the beginning of the previous word.';
    }

    getDefaultKeybinding() {
        return {
            key: Key.ARROW_LEFT,
            ctrl: true,
            alt: false,
        };
    }

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        editor.getView().resetBlink();
        editor.getCaretModel().forEachCaret(caret => {
            const offset = CtrlMoveHelper.getOffsetToPreviousWord(caret.editor.getOpenedDocument(), caret.getOffset(), CtrlMoveHelper.DELIMITER);
            caret.moveToOffset(caret.getOffset() + offset);
        });
    }
}

export class CtrlMoveCaretRightAction extends AbstractAction {
    getName(): string {
        return 'CtrlMoveCaretRight';
    }

    getDescription(): string {
        return 'Move the caret to the beginning of the next word.';
    }

    getDefaultKeybinding() {
        return {
            key: Key.ARROW_RIGHT,
            ctrl: true,
            alt: false,
        };
    }

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        editor.getView().resetBlink();
        editor.getCaretModel().forEachCaret(caret => {
            const offset = CtrlMoveHelper.getOffsetToNextWord(caret.editor.getOpenedDocument(), caret.getOffset(), CtrlMoveHelper.DELIMITER);
            caret.moveToOffset(caret.getOffset() + offset);
        });
    }
}