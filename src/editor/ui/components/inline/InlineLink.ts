import {TextRange} from "../../../core/coordinate/TextRange";
import {Token} from "../../../core/lang/lexer/TokenStream";
import {ModifierKeyHolder} from "../../../core/events/keybind";
import {Editor} from "../../../Editor";
import {EditorInstance} from "../../../EditorInstance";
import {AbstractVisualEventListener} from "../../../core/events/events";
import {InlineComponent} from "../../../core/components/InlineComponent";

export class InlineLink extends InlineComponent {
    name = "inline-link";

    className = "js-link";
    range: TextRange;
    element?: HTMLElement | undefined;

    target: Offset;

    listeners: AbstractVisualEventListener[] = [];

    constructor(token: Token<any>, target: Offset) {
        super();

        this.content = token.value;
        this.range = token.range.cloneNotTracked();

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
        console.log();
        if (ModifierKeyHolder.isCtrlPressed) {
            this.view?.addClass("js-link-hover")
        } else {
            this.view?.removeClass("js-link-hover");
        }
    }

    onLeave() {
        this.view?.removeClass("js-link-hover");
    }
}