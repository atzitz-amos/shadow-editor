import {CustomElementsRegistry} from "../CustomElementsRegistry";
import {UIComponent} from "../../engine/components/UIComponent";
import {UIVariant} from "../theme/UIVariant";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {IdeControlElement} from "../elements/IdeControlElement";

export class IdeButton extends UIComponent {
    constructor(private msg: string, private readonly variant: UIVariant = UIVariant.PRIMARY) {
        super(HTMLUtils.createElement("button.ide-btn"));
    }

    disable() {
        this.getUnderlyingElement().setAttribute("disabled", "");
    }

    enable() {
        this.getUnderlyingElement().removeAttribute("disabled");
    }

    getClassList() {
        return this.getUnderlyingElement().classList;
    }

    onClick(handler: (event: MouseEvent) => void) {
        this.addEventListener("click", handler);
    }

    setText(msg: string) {
        this.msg = msg;
        this.redraw();
    }

    public draw(): void {
        this.setInnerHTML(this.msg);

        this.getUnderlyingElement().setAttribute(this.variant, "");
    }
}

/**
 * {@code <ide-button>}: the element itself is the button (no inner {@code <button>}), so its content, style and
 * class list can be changed like those of any regular element.
 */
class _CustomIdeButton extends IdeControlElement {
    constructor() {
        super("button");

        this.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!this.disabled) this.click();
            }
        });
    }
}

CustomElementsRegistry.register("ide-button", _CustomIdeButton);
