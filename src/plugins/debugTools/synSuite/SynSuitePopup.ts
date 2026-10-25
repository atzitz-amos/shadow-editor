import {AbstractDialog} from "../../../core/ui/lib/dialog/IdeDialog";
import {SynSuiteWindow} from "./window/SynSuiteWindow";
import {SynSuiteSelection} from "./window/SynSuiteWindowState";

/**
 * Large modal popup hosting the {@link SynSuiteWindow}. It stays open on outside clicks so that other dialogs
 * (confirmations, the snapshot dialog...) can be stacked on top of it.
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class SynSuitePopup extends AbstractDialog {
    private readonly window: SynSuiteWindow;

    /**
     * @param initialSelection test or group to show, the first failing test by default
     */
    constructor(initialSelection: SynSuiteSelection | null = null) {
        super();

        this.window = new SynSuiteWindow(() => this.close(true), initialSelection);
        this.window.getUnderlyingElement().classList.add("syn-suite-popup");
        void this.window.draw();

        this.onClose(() => this.window.dispose());
    }

    isClosedOnOutsideClick(): boolean {
        return false;
    }

    /** Moved by its header only: its content drags tree rows and selects text */
    protected canBeMovedFrom(target: HTMLElement): boolean {
        return target.closest(".syn-suite-header") !== null && target.closest(".syn-suite-close") === null;
    }

    protected getPopupElement(): HTMLElement {
        return this.window.getUnderlyingElement();
    }
}
