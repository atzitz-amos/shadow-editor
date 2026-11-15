import {CodeCompletionPresentation} from "./CodeCompletionPresentation";
import {Icon} from "../../../../core/ui/icons/Icon";

/**
 *
 * @author Atzitz Amos
 * @date 10/25/2026
 * @since 1.0.0
 */
export class SimpleCodeCompletionPresentation implements CodeCompletionPresentation {

    constructor(private readonly title: string,
                private readonly source: string,
                private readonly details: string,
                private readonly icon: Icon | null) {
    }

    getIcon(): Icon | null {
        return this.icon;
    }

    getTitle(): string {
        return this.title;
    }

    getSource(): string {
        return this.source;
    }

    getDetails(): string {
        return this.details;
    }
}
