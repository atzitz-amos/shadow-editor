import {Position, TextRange} from "../../../core/Position";
import {InlineComponent} from "./Inline";
import {Token} from "../../../core/lang/lexer/TokenStream";
import {ModifierKeyHolder} from "../../../core/events/keybind";
import {Editor} from "../../../Editor";
import {EditorInstance} from "../../../EditorInstance";
import {AbstractVisualEventListener} from "../../../core/events/events";

export class InlineLink implements InlineComponent {
    id: string;

    className = "js-link";
    content: string;
    range: TextRange;
    element?: HTMLElement | undefined;

    target: Offset;

    listeners: AbstractVisualEventListener[] = [];

    constructor(token: Token<any>, target: Offset) {
        this.content = token.value;
        this.range = token.range;

        this.target = target;
    }

    onDestroy(editor: Editor): void {
        this.listeners.forEach(listener => editor.removeVisualEventListener(listener));
    }

    onRender(editor: Editor, element: HTMLSpanElement): void {
        this.element = element;

        element.addEventListener("click", () => {
            EditorInstance.with(editor, () => {
                if (ModifierKeyHolder.isCtrlPressed) {
                    let caretModel = editor.caretModel;
                    caretModel.removeAll();
                    caretModel.primary.setPosition(Position.fromOffset(editor, this.target));
                    this.onLeave();
                }
            })
        });


        element.addEventListener("mousemove", () => EditorInstance.with(editor, () => this.onEnter()));
        element.addEventListener("mouseleave", () => this.onLeave());

        let listener = new class extends AbstractVisualEventListener {
            onKeyUp(editor: Editor, event: KeyboardEvent) {
                if (event.key === "Control") {
                    element.classList.remove("js-link-hover");
                }
            }

        };
        editor.addVisualEventListener(listener)
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