import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {Editor} from "../../../../../../editor/Editor";
import {GlobalState} from "../../../../../../core/global/GlobalState";
import {UIResizeEvent} from "../../../../../core/events/UIResizeEvent";
import {Scheduler} from "../../../../../../core/scheduler/Scheduler";
import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";
import {CommonKey} from "../../../../../../core/utils/CommonKey";
import {UICommonKeys} from "../../../../../core/UICommonKeys";
import {UICommonHooks} from "../../../../../core/UICommonHooks";
import {UIHooks} from "../../../../../../core/ui/engine/hooks/UIHooks";
import {SNoOpenedEditorView} from "./SNoOpenedEditorView";
import {SMetaRowView} from "./SMetaRowView";
import {TabHooks} from "../../../../tabs/hooks/TabHooks";
import {ITab} from "../../../../tabs/tab/ITab";

/**
 *
 * @author Atzitz Amos
 * @date 3/7/2026
 * @since 1.0.0
 */
export class SMainEditorView extends UIComponent {
    private static readonly MAX_RESIZE_RETRIES = 8;
    private static readonly RESIZE_RETRY_DELAY_MS = 16;

    private readonly metaRowView: SMetaRowView;
    private readonly editorElement: HTMLElement;

    @CommonKey(UICommonKeys.MAIN_EDITOR)
    private currentEditor: Editor | null = null;

    @CommonKey(UICommonKeys.CURRENT_TAB)
    private currentTab: ITab | null = null;

    private readonly noOpenedEditorsView: SNoOpenedEditorView;

    private resizeEpoch: number = 0;
    private readonly editorResizeObserver: ResizeObserver | null;

    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("column-editor", root));

        this.metaRowView = new SMetaRowView(this.getUnderlyingElement());
        this.addChild(this.metaRowView);

        this.editorElement = HTMLUtils.createDiv("column-editor-body", this.getUnderlyingElement());
        this.noOpenedEditorsView = new SNoOpenedEditorView();

        this.editorResizeObserver = typeof ResizeObserver !== "undefined"
            ? new ResizeObserver(() => this.onResize())
            : null;
        this.editorResizeObserver?.observe(this.editorElement);

        GlobalState.getMainEventBus().subscribe(this, UIResizeEvent.SUBSCRIBER, () => this.onResize());
    }

    draw(): void {
        if (this.currentTab == null) {
            this.editorElement.style.display = "none";
            this.metaRowView.dispose();
            if (!this.getChildren().includes(this.noOpenedEditorsView)) {
                this.addChild(this.noOpenedEditorsView);
            }
        } else {
            this.editorElement.style.display = "flex";
            this.noOpenedEditorsView.dispose();

            if (!this.currentEditor) {
                this.currentEditor = new Editor(this.currentTab.getDocument());
            } else {
                this.currentEditor.changeDocument(this.currentTab.getDocument());
            }

            if (!this.getChildren().includes(this.metaRowView)) {
                this.addChildBefore(this.metaRowView, this.editorElement);
            }
            if (!this.currentEditor.isAttached()) this.currentEditor.attach(this.editorElement);
            this.onResize();
        }

        this.drawChildren();
    }

    getMainEditor() {
        return this.currentEditor;
    }

    public dispose(): void {
        this.editorResizeObserver?.disconnect();
        super.dispose();
    }

    @UIHooks.react(TabHooks.TAB_ACTIVE)
    public onTabActive(tab: ITab) {
        this.currentTab = tab;
        this.draw();
    }

    @UIHooks.react(TabHooks.TAB_CLOSE)
    public onTabHide(tab: ITab) {
        this.currentTab = null;
        this.draw();
    }

    @UIHooks.react(UICommonHooks.LAYOUT_CHANGE)
    private onResize() {
        const resizeEpoch = ++this.resizeEpoch;
        this.resizeWhenStable(resizeEpoch, 0);
    }

    private resizeWhenStable(epoch: number, attempt: number) {
        Scheduler.after(attempt === 0 ? 0 : SMainEditorView.RESIZE_RETRY_DELAY_MS, () => {
            if (epoch !== this.resizeEpoch) return;
            if (!this.currentEditor || !this.currentEditor.isAttached()) return;

            const bbox = this.editorElement.getBoundingClientRect();
            const charSize = this.currentEditor.getView().getCharSize();
            const hasLayout = this.editorElement.getClientRects().length > 0;

            const isReady = hasLayout
                && bbox.width > 0
                && bbox.height > 0
                && Number.isFinite(charSize)
                && charSize > 0;

            if (!isReady) {
                if (attempt < SMainEditorView.MAX_RESIZE_RETRIES) {
                    this.resizeWhenStable(epoch, attempt + 1);
                }
                return;
            }

            this.currentEditor.setWidthHeight(bbox.width, bbox.height);
        });
    }
}
