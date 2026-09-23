import {Icon} from "../icons/Icon";

/**
 *
 * @author Atzitz Amos
 * @date 9/12/2026
 * @since 1.0.0
 */
export interface Describable {
    getDescription(): string;

    getIcon?(): Icon | null;
}
