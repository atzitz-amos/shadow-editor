import {AbstractAction} from "./AbstractAction";
import {Editor} from "../../Editor";
import {Key} from "../events/keybind";
import {SelectionDirection} from "../Selection";
import {Caret} from "../Caret";

import {LogicalPosition} from "../coordinate/LogicalPosition";
import {CtrlMoveHelper} from "./utils/CtrlMoveHelper";


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

    keybinding = {
        key: Key.ARROW_LEFT,
        ctrl: false,
        alt: false,
    };

    run(editor: Editor, event: KeyboardEvent) {
        editor.caretModel.forEachCaret(caret => {
            let selectionDirection = caret.selectionModel.getDirection();
            if (!event.shiftKey && selectionDirection !== SelectionDirection.UNKNOWN) {
                handleClearSelection(caret, selectionDirection === SelectionDirection.RIGHT);
            } else {
                caret.shift(-1);
            }
        });

        editor.view.resetBlink();
    }

}

export class MoveCaretRightAction extends AbstractAction {
    name = 'MoveCaretRight';
    description = 'Move the caret to the right by one character.';

    keybinding = {
        key: Key.ARROW_RIGHT,
        ctrl: false,
        alt: false,

    };

    run(editor: Editor, event: KeyboardEvent) {
        editor.caretModel.forEachCaret(caret => {
            let selectionDirection = caret.selectionModel.getDirection();
            if (!event.shiftKey && selectionDirection !== SelectionDirection.UNKNOWN) {
                handleClearSelection(caret, selectionDirection === SelectionDirection.LEFT);
            } else {
                caret.shift(1);
            }
        });
        editor.view.resetBlink();
    }

}

export class MoveCaretUpAction extends AbstractAction {
    name = 'MoveCaretUp';
    description = 'Move the caret up one line.';

    keybinding = {
        key: Key.ARROW_UP,
        ctrl: false,
        alt: false,

    };

    run(editor: Editor, event: KeyboardEvent) {
        editor.view.resetBlink();
        editor.caretModel.forEachCaret(caret => {
            if (!event.shiftKey && caret.selectionModel.getDirection() !== SelectionDirection.UNKNOWN) {
                handleClearSelection(caret, caret.selectionModel.getDirection() === SelectionDirection.RIGHT);
            }

            let caretPos = caret.getLogical();

            if (caretPos.row === 0) return;

            caret.setVertMovementPos();
            let pos = new LogicalPosition(
                Math.min(editor.getOpenedDocument().getLineLength(caretPos.row - 1), caret.vertMovementPos),
                caretPos.row - 1
            )
            caret.moveToLogical(pos);
        });
    }

}

export class MoveCaretDownAction extends AbstractAction {
    name = 'MoveCaretDown';
    description = 'Move the caret down one line.';

    keybinding = {
        key: Key.ARROW_DOWN,
        ctrl: false,
        alt: false,
    };

    run(editor: Editor, event: KeyboardEvent) {
        editor.view.resetBlink();
        editor.caretModel.forEachCaret(caret => {
            if (!event.shiftKey && caret.selectionModel.getDirection() !== SelectionDirection.UNKNOWN) {
                handleClearSelection(caret, caret.selectionModel.getDirection() === SelectionDirection.LEFT);
            }

            let caretPos = caret.getLogical();

            if (caretPos.row >= editor.getLineCount() - 1) return;

            caret.setVertMovementPos();
            let pos = new LogicalPosition(
                Math.min(editor.getOpenedDocument().getLineLength(caretPos.row + 1), caret.vertMovementPos),
                caretPos.row + 1
            )
            caret.moveToLogical(pos);
        });
    }
}

export class MoveCaretToStartAction extends AbstractAction {
    name = 'MoveCaretToStart';
    description = 'Move the caret to the start of the line.';

    keybinding = {
        key: Key.HOME,
        ctrl: false,
        alt: false
    };

    run(editor: Editor, event: KeyboardEvent) {
        editor.view.resetBlink();
        editor.caretModel.forEachCaret(caret => {
            caret.vertMovementPos = 0;
            caret.moveToLogical(new LogicalPosition(0, caret.getLogical().row));
        });
    }
}

export class MoveCaretToEndAction extends AbstractAction {
    name = 'MoveCaretToEnd';
    description = 'Move the caret to the end of the line.';

    keybinding = {
        key: Key.END,
        ctrl: false,
        alt: false
    };

    run(editor: Editor, event: KeyboardEvent) {
        editor.view.resetBlink();
        editor.caretModel.forEachCaret(caret => {
            let lineLength = editor.getOpenedDocument().getLineLength(caret.getLogical().row);
            caret.vertMovementPos = lineLength;
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

    keybinding = {
        key: Key.ARROW_LEFT,
        ctrl: true,
        alt: false,
    };

    run(editor: Editor, event: KeyboardEvent) {
        editor.view.resetBlink();
        editor.caretModel.forEachCaret(caret => {
            const offset = CtrlMoveHelper.getOffsetToPreviousWord(caret.editor.getOpenedDocument(), caret.getOffset(), CtrlMoveHelper.DELIMITER);
            caret.shift(offset);
        });
    }
}

export class CtrlMoveCaretRightAction extends AbstractAction {
    name = 'CtrlMoveCaretRight';
    description = 'Move the caret to the beginning of the next word.';

    keybinding = {
        key: Key.ARROW_RIGHT,
        ctrl: true,
        alt: false,
    };

    run(editor: Editor, event: KeyboardEvent) {
        editor.view.resetBlink();
        editor.caretModel.forEachCaret(caret => {
            const offset = CtrlMoveHelper.getOffsetToNextWord(caret.editor.getOpenedDocument(), caret.getOffset(), CtrlMoveHelper.DELIMITER);
            caret.shift(offset);
        });
    }
}