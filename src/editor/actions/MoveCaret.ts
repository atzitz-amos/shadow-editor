import {AbstractAction} from "../../core/actions/AbstractAction";
import {Key, ModifierKeyHolder} from "../../core/keybinds/Keybind";
import {SelectionDirection} from "../core/caret/Selection";
import {Caret} from "../core/caret/Caret";

import {LogicalPosition} from "../core/coordinate/LogicalPosition";
import {CtrlMoveHelper} from "./utils/CtrlMoveHelper";
import {KeybindContext} from "../../core/keybinds/context/KeybindContext";


function handleClearSelection(caret: Caret, shouldMove: boolean) {
    let start = caret.selectionModel.startOffset;
    caret.selectionModel.clear();
    if (shouldMove) {
        caret.moveToOffset(start!);
    }
}

export class MoveCaretLeftAction extends AbstractAction {
    name = 'MoveCaretLeft';
    description = 'Move the caret to the left by one character.';

    defaultKeybinding = {
        key: Key.ARROW_LEFT,
        ctrl: false,
        alt: false,
    };

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        editor.getCaretModel().forEachCaret(caret => {
            let selectionDirection = caret.selectionModel.getDirection();
            if (!ctx.getEvent().shiftKey && selectionDirection !== SelectionDirection.UNKNOWN) {
                handleClearSelection(caret, selectionDirection === SelectionDirection.RIGHT);
            } else {
                caret.shiftLeft(!ModifierKeyHolder.isShiftPressed);
            }
        });

        editor.getView().resetBlink();
    }

}

export class MoveCaretRightAction extends AbstractAction {
    name = 'MoveCaretRight';
    description = 'Move the caret to the right by one character.';

    defaultKeybinding = {
        key: Key.ARROW_RIGHT,
        ctrl: false,
        alt: false,

    };

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        editor.getCaretModel().forEachCaret(caret => {
            let selectionDirection = caret.selectionModel.getDirection();
            if (!ctx.getEvent().shiftKey && selectionDirection !== SelectionDirection.UNKNOWN) {
                handleClearSelection(caret, selectionDirection === SelectionDirection.LEFT);
            } else {
                caret.shiftRight(!ModifierKeyHolder.isShiftPressed);
            }
        });
        editor.getView().resetBlink();
    }

}

export class MoveCaretUpAction extends AbstractAction {
    name = 'MoveCaretUp';
    description = 'Move the caret up one line.';

    defaultKeybinding = {
        key: Key.ARROW_UP,
        ctrl: false,
        alt: false,

    };

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
    name = 'MoveCaretDown';
    description = 'Move the caret down one line.';

    defaultKeybinding = {
        key: Key.ARROW_DOWN,
        ctrl: false,
        alt: false,
    };

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
    name = 'MoveCaretToStart';
    description = 'Move the caret to the start of the line.';

    defaultKeybinding = {
        key: Key.HOME,
        ctrl: false,
        alt: false
    };

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
    name = 'MoveCaretToEnd';
    description = 'Move the caret to the end of the line.';

    defaultKeybinding = {
        key: Key.END,
        ctrl: false,
        alt: false
    };

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
    name = 'CtrlMoveCaretLeft';
    description = 'Move the caret to the beginning of the previous word.';

    defaultKeybinding = {
        key: Key.ARROW_LEFT,
        ctrl: true,
        alt: false,
    };

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
    name = 'CtrlMoveCaretRight';
    description = 'Move the caret to the beginning of the next word.';

    defaultKeybinding = {
        key: Key.ARROW_RIGHT,
        ctrl: true,
        alt: false,
    };

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        editor.getView().resetBlink();
        editor.getCaretModel().forEachCaret(caret => {
            const offset = CtrlMoveHelper.getOffsetToNextWord(caret.editor.getOpenedDocument(), caret.getOffset(), CtrlMoveHelper.DELIMITER);
            caret.moveToOffset(caret.getOffset() + offset);
        });
    }
}