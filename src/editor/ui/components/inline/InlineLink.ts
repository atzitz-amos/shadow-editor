import {TextRange} from "../../../core/coordinate/TextRange";
import {ModifierKeyHolder} from "../../../core/events/keybind";
import {Editor} from "../../../Editor";
import {EditorInstance} from "../../../EditorInstance";
import {AbstractVisualEventListener} from "../../../core/events/events";
import {InlineComponent} from "../../../core/components/InlineComponent";
import {Token} from "../../../lang/tokens/Token";

export class InlineLink extends InlineComponent {
    name = "inline-link";

    className = "js-link";
    range: TextRange;
    element?: HTMLElement | undefined;

    target: Offset;

    listeners: AbstractVisualEventListener[] = [];

    constructor(token: Token, target: Offset) {
        super();

        this.content = token.getRaw();
        this.range = token.getRange().cloneNotTracked();

        this.target = target;
    }

    onDestroy(editor: Editor): void {
        this.listeners.forEach(listener => editor.removeVisualEventListener(listener));
    }

    onceRendered(): void {
        let view = this.view!;

        view.addEventListener("click", () => {
            EditorInstance.with(view.getEditor(), () => {
                if (ModifierKeyHolder.isCtrlPressed) {
                    let caretModel = view.getEditor().getCaretModel();
                    caretModel.removeAll();
                    caretModel.getPrimary().moveToOffset(this.target);
                    this.onLeave();
                }
            })
        });


        view.addEventListener("mousemove", () => EditorInstance.with(view.getEditor(), () => this.onEnter()));
        view.addEventListener("mouseleave", () => this.onLeave());


        let listener = new class extends AbstractVisualEventListener {
            onKeyUp(editor: Editor, event: KeyboardEvent) {
                if (event.key === "Control") {
                    view.removeClass("js-link-hover");
                }
            }

        };
        view.getEditor().addVisualEventListener(listener)
        this.listeners.push(listener);
    }

    onEnter() {
        if (ModifierKeyHolder.isCtrlPressed) {
            this.element?.classList.add("js-link-hover")
        } else {
            this.element?.classList.remove("js-link-hover");
        }
    }

    onLeave() {
        this.element?.classList.remove("js-link-hover");
    }
}