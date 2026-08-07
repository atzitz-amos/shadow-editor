import {JsAssignmentTarget} from "../target/JsAssignmentTarget";
import {JsSimpleAssignment} from "../JsSimpleAssignment";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export interface JsAssignmentSource {
    assign(target: JsAssignmentTarget): JsSimpleAssignment[];
}
