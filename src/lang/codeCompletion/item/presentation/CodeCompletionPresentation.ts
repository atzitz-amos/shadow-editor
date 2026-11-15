import {Icon} from "../../../../core/ui/icons/Icon";

/**
 *
 * @author Atzitz Amos
 * @date 10/25/2026
 * @since 1.0.0
 */
export interface CodeCompletionPresentation {
    getIcon(): Icon | null;

    getTitle(): string;

    getSource(): string;

    getDetails(): string;
}
