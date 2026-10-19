import {IBehaviorProvider} from "../IBehaviorProvider";
import {Editor} from "../../../Editor";

/**
 *
 * @author Atzitz Amos
 * @date 6/10/2026
 * @since 1.0.0
 */
export interface IEditorMode extends IBehaviorProvider {
    getCustomRenderer(): any | null;

    getDisplayName(): string;

    onEnter(editor: Editor): void;

    onExit(editor: Editor): void;
}
