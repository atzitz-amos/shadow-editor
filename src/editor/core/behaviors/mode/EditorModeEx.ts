import {IEditorMode} from "./IEditorMode";
import {EditorBehavior} from "../EditorBehavior";
import {CtrlDeleteBehavior} from "../behavior/CtrlDeleteBehavior";
import {Editor} from "../../../Editor";
import {ICustomHighlighter} from "../../../../lang/highlighter/custom/ICustomHighlighter";

/**
 *
 * @author Atzitz Amos
 * @date 6/10/2026
 * @since 1.0.0
 */
export abstract class EditorModeEx implements IEditorMode {
    getCustomHighlighter(): ICustomHighlighter | null {
        return null;
    }

    getDisplayName(): string {
        return "";
    }

    onEnter(editor: Editor) {
    }

    onExit(editor: Editor) {
    }

    escapeWillExit(): boolean {
        return true;
    }

    getCharTypedBehavior(): EditorBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getDeleteBackwardBehavior(): EditorBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getDeleteForwardBehavior(): EditorBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getCtrlDeleteBehavior(): CtrlDeleteBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getTabPressedBehavior(): EditorBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getShiftTabPressedBehavior(): EditorBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getEnterPressedBehavior(): EditorBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getCopyBehavior(): EditorBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getCutBehavior(): EditorBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getPasteBehavior(): EditorBehavior {
        return EditorBehavior.FORWARD_ALL;
    }
}
