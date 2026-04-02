import {View} from "./ui/view/View";
import {EditorProperties} from "./Properties";
import {TextRange} from "./core/coordinate/TextRange";
import {Caret, CaretModel} from "./core/caret/Caret";
import {Key, ModifierKeyHolder} from "../core/keybinds/Keybind";

import {HTMLUtils} from "./utils/HTMLUtils";
import {Document} from "./core/document/Document";
import {WidgetManager} from "./core/components/WidgetManager";
import {LogicalPosition} from "./core/coordinate/LogicalPosition";
import {VisualPosition} from "./core/coordinate/VisualPosition";
import {XYPoint} from "./core/coordinate/XYPoint";
import {EditorCoordinateMapper} from "./core/coordinate/EditorCoordinateMapper";
import {InlayManager} from "./core/inlay/InlayManager";
import {PluginManager} from "../core/plugins/PluginManager";
import {LanguageBase} from "../core/lang/LanguageBase";
import JsLang from "../plugins/jsLang/lang/JsLang";
import {LangSupport} from "../core/lang/LangSupport";
import {LangService} from "./core/lang/LangService";
import {EventBus} from "../core/events/EventBus";
import {KeybindManager} from "../core/keybinds/KeybindManager";
import {EditorAttachedEvent} from "./events/EditorAttachedEvent";
import {KeyPressedEvent, KeyReleasedEvent, MousePressedEvent, MouseReleasedEvent} from "./events/PhysicalEvents";
import {InlayWidget} from "./ui/inline/inlay/InlayWidget";
import {KeybindContext} from "../core/keybinds/context/KeybindContext";
import {GlobalState} from "../core/global/GlobalState";
import {Scheduler} from "../core/scheduler/Scheduler";

export class Editor {
    private static ID_COUNTER = 0;

    id: number;
    properties: EditorProperties;
    view: View;
    root: HTMLElement;
    document: Document;
    langService: LangService;
    widgetManager: WidgetManager;
    inlayManager: InlayManager;
    coordinateMapper: EditorCoordinateMapper;
    caretModel: CaretModel;
    eventBus: EventBus;
    perfCheckRunning: boolean = false;

    private renderingProcess: any;

    constructor(options?: EditorProperties) {
        this.id = Editor.ID_COUNTER++;

        if (!GlobalState.isReady()) {
            throw new Error("No running shadow app instance found");
        }

        this.properties = options || {};

        this.eventBus = new EventBus('editor.bus');

        this.document = new Document(this, "");
        this.langService = new LangService(this);
        this.widgetManager = new WidgetManager(this);

        this.langService.setCurrentLanguage(JsLang.class);

        this.view = new View(this);

        this.inlayManager = new InlayManager(this);
        this.coordinateMapper = new EditorCoordinateMapper(this.view);

        this.caretModel = new CaretModel(this);
    }

    attach(element: HTMLElement) {
        this.root = HTMLUtils.createElement('div.editor', element) as HTMLDivElement;
        Scheduler.defer(() => {
            this.view.onAttached(this.root);
        });

        this.eventBus.asyncPublish(new EditorAttachedEvent(this, this.root));
        this.resumeRender();
    }

    /**
     +--------------------------+
     |           Data           |
     +--------------------------+    */
    getEventBus(): EventBus {
        return this.eventBus;
    }

    getOpenedFile() {
        return this.document.getAssociatedFile();
    }

    getOpenedDocument(): Document {
        return this.document;
    }

    getCurrentLanguage(): LanguageBase | null {
        return this.document.getLanguage();
    }

    getLangSupport() {
        return LangSupport.getInstance();
    }

    getLangService(): LangService {
        return this.langService;
    }

    getWidgetManager(): WidgetManager {
        return this.widgetManager;
    }

    getCaretModel(): CaretModel {
        return this.caretModel;
    }

    getPrimaryCaret(): Caret {
        return this.caretModel.getPrimary();
    }

    getPluginManager(): PluginManager {
        return PluginManager.getInstance();
    }

    getInlayManager(): InlayManager {
        return this.inlayManager;
    }

    setWidthHeight(width: number, height: number) {
        const vLineCount = Math.floor(height / this.view.getLineHeight());
        const vCharCount = Math.floor(width / this.view.getCharSize());

        this.view.getProperties().setWidth(vCharCount * this.view.getCharSize());
        this.view.getProperties().setHeight(vLineCount * this.view.getLineHeight());
        this.view.setResizeDirty();
    }

    /**
     +--------------------------+
     |         Position         |
     +--------------------------+    */

    public offsetToLogical(offset: number): LogicalPosition {
        return this.coordinateMapper.offsetToLogical(offset);
    }

    public offsetToVisual(offset: Offset): VisualPosition {
        return this.coordinateMapper.offsetToVisual(offset);
    }

    public logicalToOffset(logical: LogicalPosition): Offset {
        return this.coordinateMapper.logicalToOffset(logical);
    }

    public logicalToVisual(logical: LogicalPosition): VisualPosition {
        return this.coordinateMapper.logicalToVisual(logical);
    }

    public visualToOffset(visual: VisualPosition): Offset {
        return this.coordinateMapper.visualToOffset(visual);
    }

    public visualToLogical(visual: VisualPosition): LogicalPosition {
        return this.coordinateMapper.visualToLogical(visual);
    }

    public logicalToXY(pos: LogicalPosition): XYPoint {
        return this.coordinateMapper.logicalToXY(pos);
    }

    public visualToXY(pos: VisualPosition): XYPoint {
        return this.coordinateMapper.visualToXY(pos);
    }

    public xyToNearestVisual(x: number, y: number): VisualPosition {
        return this.coordinateMapper.xyToNearestVisual(new XYPoint(x, y));
    }

    getFullRange() {
        return new TextRange(0, this.document.getTotalDocumentLength());
    }

    isValidOffset(offset: Offset): boolean {
        return offset >= 0 && offset <= this.document.getTotalDocumentLength();
    }

    /**
     +---------------------------+
     |           Logic           |
     +---------------------------+    */

    moveCursorToMouseEvent(event: MouseEvent) {
        let [x, y] = this.view.getRelativePos(event);
        let visual = this.xyToNearestVisual(x, y);

        this.getPrimaryCaret().moveToVisual(visual);

        this.view.resetBlink();
    }

    type(char: string) {
        this.caretModel.forEachCaret(caret => {
            if (caret.getSelectionModel().isSelectionActive) {
                this.deleteSelection(caret);
            }

            this.insertText(caret.getOffset(), char)
            caret.shiftRight(false);
            caret.refresh();
            this.view.resetBlink();
        });
    }

    insertText(offset: Offset, text: string) {
        // Insert the text at the specified offset
        this.document.insertText(offset, text);
        this.view.triggerRepaint();
    }

    deleteAt(offset: Offset, n: number = 1) {
        if (offset < 0 || offset >= this.document.getTotalDocumentLength()) {
            return;
        }

        // Delete the character at the specified offset
        this.document.deleteAt(offset, n);

        this.view.triggerRepaint();
    }

    deleteSelection(caret: Caret) {
        let selection = caret.getSelectionModel();
        if (!selection.isSelectionActive) return;

        let start = selection.getActualStart();

        this.deleteAt(this.logicalToOffset(start), selection.getSelectionLength());

        caret.moveToLogical(start);
    }

    getLineCount() {
        return this.document.getLineCount();
    }

    /**
     +-----------------------+
     |       Components      |
     +-----------------------+    */

    addInlay(element: InlayWidget) {
        this.widgetManager.addInlayWidget(element);
        this.view.triggerRepaint()
    }

    /**
     +---------------------------+
     |      Event Listeners      |
     +---------------------------+    */

    onKeyUp(event: KeyboardEvent) {
        ModifierKeyHolder.getInstance().set(event);

        this.eventBus.syncPublish(new KeyReleasedEvent(this, event));
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.key === Key.ENTER) {
            ModifierKeyHolder.getInstance().clear();
            return this.type('\n');
        }
        ModifierKeyHolder.getInstance().set(event);

        KeybindManager.getInstance().onKeydown(KeybindContext.fromEditor(this, event));
        this.eventBus.syncPublish(new KeyPressedEvent(this, event));
    }

    onMouseDown(event: MouseEvent) {
        ModifierKeyHolder.getInstance().set(event);

        this.caretModel.removeAll();
        this.moveCursorToMouseEvent(event);

        KeybindManager.getInstance().onMousedown(KeybindContext.fromEditor(this, event));
        this.eventBus.syncPublish(new MousePressedEvent(this, event));
    }

    onMouseUp(event: MouseEvent) {
        ModifierKeyHolder.getInstance().set(event);
        ModifierKeyHolder.getInstance().setIsDragging(false);
        ModifierKeyHolder.getInstance().isMouseDown = false;

        this.eventBus.syncPublish(new MouseReleasedEvent(this, event));
    }

    onMouseMove(event: MouseEvent) {
        if (ModifierKeyHolder.isMouseDown) {
            ModifierKeyHolder.getInstance().setIsDragging(true);
            this.moveCursorToMouseEvent(event);
        }
    }

    onInput(event: InputEvent) {
        ModifierKeyHolder.getInstance().clear();
        if (event.data) this.type(event.data);
    }

    /**
     * Repeatedly log the fps of the application */
    perfCheckBegin() {
        let lastTime = performance.now();

        this.perfCheckRunning = true;
        let perfCheckRunning = () => this.perfCheckRunning

        requestAnimationFrame(function update(time) {
            const delta = time - lastTime;
            let fps = 1000 / delta;
            console.log(`FPS: ${fps.toFixed(2)}`);
            lastTime = time;

            if (perfCheckRunning()) requestAnimationFrame(update);
        });
    }

    perfCheckEnd() {
        this.perfCheckRunning = false;
    }

    pauseRender() {
        clearInterval(this.renderingProcess);
    }

    resumeRender() {
        this.renderingProcess = setInterval(() => {
            this.view.render();
        }, 20);
    }

    refreshView() {
        this.view.triggerRepaint();
    }
}