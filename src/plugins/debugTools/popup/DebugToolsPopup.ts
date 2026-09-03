import {AbstractPopup} from "../../../core/ui/lib/popup/IdePopup";
import {HTMLUtils} from "../../../editor/utils/HTMLUtils";
import {Persisted} from "../../../core/persistence/objects/Persisted";
import {DebugToolTab} from "./DebugToolTab";
import {ASTTreeTab} from "./astTree/ASTTreeTab";
import {Scheduler} from "../../../core/scheduler/Scheduler";
import {CodeStyleTab} from "./codeStyle/CodeStyleTab";
import {GlobalState} from "../../../core/global/GlobalState";
import {KeyPressedEvent} from "../../../editor/impl/events/PhysicalEvents";

/**
 *
 * @author Atzitz Amos
 * @date 8/29/2026
 * @since 1.0.0
 */
export class DebugToolsPopup extends AbstractPopup {
    @Persisted
    private static accessor xPosition: number = 600;

    @Persisted
    private static accessor yPosition: number = 400;

    @Persisted
    private static accessor selectedTab: string | null = null;

    private readonly popupElement: HTMLElement = HTMLUtils.createElement("div.debug-popup");
    private readonly contentElement: HTMLElement;

    private readonly tabs: DebugToolTab[] = [
        new ASTTreeTab(),
        new CodeStyleTab()
    ];

    constructor() {
        super();

        GlobalState.getMainEventBus().subscribe(this, KeyPressedEvent.SUBSCRIBER, e => {
            if (e.getEvent().key === "Escape") {
                this.close(false);
            }
        });

        this.popupElement.innerHTML = `
              <div class="debug-popup-header" id="debugPopupHeader">
                <div class="debug-popup-title">
                  Debug Tools
                </div>
                <div class="debug-popup-actions">
                  <i class="fa fa-close"></i>
                </div>
              </div>
              <div class="debug-popup-tabs" id="debugTabs">
              </div>
          <div class="debug-popup-content" id="debugPopupContent">No content</div>
        `;

        this.contentElement = this.popupElement.querySelector("#debugPopupContent") as HTMLElement;

        this.popupElement.style.left = HTMLUtils.px(DebugToolsPopup.xPosition);
        this.popupElement.style.top = HTMLUtils.px(DebugToolsPopup.yPosition);

        const header = this.popupElement.querySelector("#debugPopupHeader") as HTMLElement;
        const closeButton = header.querySelector(".fa-close") as HTMLElement;
        closeButton.addEventListener("click", () => this.close(false));

        this.setupTabs(this.popupElement.querySelector("#debugTabs") as HTMLElement);
    }

    setActive(key: string) {
        const tab = this.tabs.find(t => t.getName() == key);

        if (DebugToolsPopup.selectedTab) {
            document.querySelector(".debug-tab.active")?.classList.remove("active");
            const unactiveTab = this.tabs.find(t => t.getName() == DebugToolsPopup.selectedTab);
            if (unactiveTab) {
                unactiveTab.setSelected(false);
            }
        }

        document.querySelector(`.debug-tab[data-tab="${key}"]`)?.classList.add("active");

        console.log("Active", key);

        if (!tab) {
            this.contentElement.innerHTML = "No content";
        } else {
            this.contentElement.innerHTML = "";
            this.contentElement.appendChild(tab.getElement());
            tab.setSelected(true);
        }

        DebugToolsPopup.selectedTab = key;
    }


    isTransparent(): boolean {
        return true;
    }

    protected getPopupElement(): HTMLElement {
        return this.popupElement;
    }

    protected onDrag(newX: number, newY: number) {
        Scheduler.debounce(() => {
            DebugToolsPopup.xPosition = newX;
            DebugToolsPopup.yPosition = newY;
        }, 1000)
    }

    private setupTabs(tabsElement: HTMLElement) {
        for (const tab of this.tabs) {
            const button = HTMLUtils.createElement(`button.debug-tab`);
            button.textContent = tab.getTitle();
            button.dataset.tab = tab.getName();

            button.addEventListener("click", () => this.setActive(tab.getName()));

            tabsElement.appendChild(button);

            tab.init();
        }

        Scheduler.defer(() => this.setActive(DebugToolsPopup.selectedTab ?? this.tabs[0].getName()));

        this.onClose(() => {
            for (const tab of this.tabs) {
                tab.dispose();
            }

            GlobalState.getMainEventBus().unsubscribe(this, KeyPressedEvent.SUBSCRIBER);
        })
    }
}
