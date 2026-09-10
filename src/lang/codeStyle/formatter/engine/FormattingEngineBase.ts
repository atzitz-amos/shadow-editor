import {FormattingBlock} from "../nodes/FormattingBlock";
import {CodeStyleManager} from "../../manager/CodeStyleManager";

/**
 *
 * @author Atzitz Amos
 * @date 9/9/2026
 * @since 1.0.0
 */
export abstract class FormattingEngineBase {

    constructor(protected readonly manager: CodeStyleManager) {
    }

    abstract format(block: FormattingBlock): string;
}
