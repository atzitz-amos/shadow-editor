import {AbstractAction} from "./AbstractAction";
import {Editor} from "../../Editor";
import {Key} from "../events/keybind";
import {SelectionDirection} from "../Selection";
import {Caret} from "../Caret";


function handleClearSelection(caret: Caret, shouldMove: boolean) {
    let start = caret.selectionModel.start;
    caret.selectionModel.clear();
    if (shouldMove) {
        caret.moveToLogical(start!);
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
            let selectionDirection = caret.selectionModel.direction;
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
            let selectionDirection = caret.selectionModel.direction;
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
            if (!event.shiftKey && caret.selectionModel.direction !== SelectionDirection.UNKNOWN) {
                handleClearSelection(caret, caret.selectionModel.direction === SelectionDirection.RIGHT);
            }

            if (caret.position.y === 0) return;

            caret.setVertMovementPos();
            let pos = editor.createLogical(
                Math.min(editor.getLineLength(caret.position.y - 1), caret.vertMovementPos),
                caret.position.y - 1
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
            if (!event.shiftKey && caret.selectionModel.direction !== SelectionDirection.UNKNOWN) {
                handleClearSelection(caret, caret.selectionModel.direction === SelectionDirection.LEFT);
            }

            if (caret.position.y >= editor.getLineCount() - 1) return;

            caret.setVertMovementPos();
            let pos = editor.createLogical(
                Math.min(editor.getLineLength(caret.position.y + 1), caret.vertMovementPos),
                caret.position.y + 1
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
            caret.moveToLogical(editor.createLogical(0, caret.position.y));
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
            let lineLength = editor.getLineLength(caret.position.y);
            caret.vertMovementPos = lineLength;
            caret.moveToLogical(editor.createLogical(
                lineLength,
                caret.position.y
            ));
        });
    }
}