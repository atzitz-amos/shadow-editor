import {IBehaviorProvider} from "../IBehaviorProvider";

/**
 *
 * @author Atzitz Amos
 * @date 6/10/2026
 * @since 1.0.0
 */
export interface IEditorMode extends IBehaviorProvider {
    getCustomRenderer(): any | null;
}
