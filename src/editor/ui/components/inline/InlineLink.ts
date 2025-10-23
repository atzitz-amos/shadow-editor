import {TextRange} from "../../../core/coordinate/TextRange";
import {ModifierKeyHolder} from "../../../core/events/Keybind";
import {Editor} from "../../../Editor";
import {EditorInstance} from "../../../EditorInstance";
import {InlineComponent} from "../../../core/components/InlineComponent";
import {Token} from "../../../lang/tokens/Token";
import {KeyPressedEvent} from "../../../events/PhysicalEvents";

export class InlineLink extends InlineComponent {
    name = "inline-link";

    className = "js-link";
    range: TextRange;
    element?: HTMLElement | undefined;

    target: Offset;

    constructor(token: Token, target: Offset) {
        super();

        this.range = token.getRange().cloneNotTracked();

        this.target = target;
    }

    onDestroy(editor: Editor): void {
        editor.getEventBus().unsubscribe(this, KeyPressedEvent.SUBSCRIBER);
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


        view.getEditor().getEventBus().subscribe(this, KeyPressedEvent.SUBSCRIBER, (event: KeyPressedEvent) => {
                if (event.getEvent().key === "Control") {
                    view.removeClass("js-link-hover");
                }
            }
        );
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