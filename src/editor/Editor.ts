import {View} from "./ui/view/View";
import {TextRange} from "./core/coordinate/range/TextRange";
import {Caret, CaretModel} from "./core/caret/Caret";
import {ModifierKeyHolder} from "../core/keybinds/Keybind";

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
import {LangSupport} from "../core/lang/LangSupport";
import {EditorLangService} from "./core/lang/EditorLangService";
import {EventBus} from "../core/events/EventBus";
import {KeybindManager} from "../core/keybinds/KeybindManager";
import {EditorAttachedEvent} from "./impl/events/EditorAttachedEvent";
import {
    KeyPressedEvent,
    KeyReleasedEvent,
    KeyTypedEvent,
    MouseMovedEvent,
    MousePressedEvent,
    MouseReleasedEvent
} from "./impl/events/PhysicalEvents";
import {InlayWidget} from "./ui/inline/widget/inlay/InlayWidget";
import {KeybindContext} from "../core/keybinds/context/KeybindContext";
import {GlobalState} from "../core/global/GlobalState";
import {Scheduler} from "../core/scheduler/Scheduler";
import {UndoRedoManager} from "./core/undo/UndoRedoManager";
import {BehaviorManager} from "./core/behaviors/manager/BehaviorManager";
import {StandardBehaviorManagerProvider} from "./impl/behaviors/StandardBehaviorManagerProvider";
import {EditorCharTypedContext} from "./core/behaviors/context/EditorCharTypedContext";

export class Editor {
    private static ID_COUNTER = 0;
    private readonly id: number;

    private readonly view: View;
    private readonly coordinateMapper: EditorCoordinateMapper;

    private root: HTMLElement;
    private _attached: boolean = false;

    private readonly behaviorManager: BehaviorManager;

    private readonly widgetManager: WidgetManager;
    private readonly inlayManager: InlayManager;
    private readonly caretModel: CaretModel;
    private readonly langService: EditorLangService;
    private readonly undoRedo: UndoRedoManager;

    private readonly eventBus: EventBus;

    private document: Document;

    private renderingProcess: any;
    private perfCheckRunning: boolean = false;

    constructor(document: Document) {
        this.id = Editor.ID_COUNTER++;

        if (!GlobalState.isReady()) {
            throw new Error("No running shadow app instance found");
        }

        this.eventBus = GlobalState.getMainEventBus().createSubBus(`editor-${this.id}.bus`);

        this.behaviorManager = StandardBehaviorManagerProvider.createDefault();

        this.langService = new EditorLangService(this);
        this.widgetManager = new WidgetManager(this);
        this.undoRedo = new UndoRedoManager(this);

        this.document = document;
        this.document.linkEditor(this);

        this.view = new View(this);

        this.inlayManager = new InlayManager(this);
        this.coordinateMapper = new EditorCoordinateMapper(this.view);

        this.caretModel = new CaretModel(this, this.offsetToLogical(document.getSavedCaretOffset()));
    }

    isAttached() {
        return this._attached;
    }

    attach(element: HTMLElement) {
        this.root = HTMLUtils.createElement('div.editor', element) as HTMLDivElement;

        Scheduler.defer(() => {
            this.view.onAttached(this.root);
        });

        this.eventBus.asyncPublish(new EditorAttachedEvent(this, this.root));
        this.resumeRender();

        this._attached = true;
    }

    changeDocument(document: Document) {
        this.document.saveCaretOffset();

        this.caretModel.removeAllIncludingPrimary();

        this.document.linkEditor(null);
        this.document = document;

        this.document.linkEditor(this);
        this.caretModel.addCaret(this.offsetToLogical(document.getSavedCaretOffset()));

        this.view.ensureCaretVisible();

        this.repaintView();
    }

    overrideLanguage(language: LanguageBase | null) {
        this.behaviorManager.setLanguage(language);

        this.langService.setCurrentLanguage(language);
        this.langService.forceUpdate(this.document);
    }

    /**
     +--------------------------+
     |           Data           |
     +--------------------------+    */
    getView(): View {
        return this.view;
    }

    getBehaviorManager(): BehaviorManager {
        return this.behaviorManager;
    }

    getCoordinateMapper(): EditorCoordinateMapper {
        return this.coordinateMapper;
    }

    getRootElement(): HTMLElement {
        return this.root;
    }

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

    getUndoRedo() {
        return this.undoRedo;
    }

    getLangService(): EditorLangService {
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

    public xyToNearestLogical(x: number, y: number): LogicalPosition {
        return this.coordinateMapper.xyToLogical(new XYPoint(x, y));
    }

    public xyToExactOffset(xy: XYPoint) {
        return this.coordinateMapper.xyToExactOffset(xy);
    }

    public yToLine(y: number): number {
        return this.coordinateMapper.yToLine(y);
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

    moveCaretToMouseEvent(event: MouseEvent) {
        let [x, y] = this.view.getRelativePos(event);
        let visual = this.xyToNearestVisual(x, y);

        if (!visual.is(this.getPrimaryCaret().getVisual()))
            this.getUndoRedo().commitPartialEdits();
        this.getPrimaryCaret().moveToVisual(visual);

        this.view.resetBlink();
    }

    type(content: string) {
        this.caretModel.forEachCaret(caret => {
            this.typeForCaret(caret, content);
        });
    }

    typeForCaret(caret: Caret, content: string, moveCaret: boolean = true) {
        if (!this.eventBus.publishCancellable(new KeyTypedEvent(this, content, caret))) {
            return;
        }

        this.behaviorManager.invokeCharTyped(new EditorCharTypedContext(this, caret, content, moveCaret));
    }

    /**
     * Insert text at the specified offset
     * @see type
     */
    insertText(offset: Offset, text: string) {
        // Insert the text at the specified offset
        this.document.insertText(offset, text);
        this.view.triggerRepaint();
    }

    replaceRange(range: TextRange, text: string) {
        const deleted = this.document.replaceRange(range, text);

        this.caretModel.forEachCaret(caret => {
            const old = caret.getOffset();
            if (caret.getOffset() > this.document.getTotalDocumentLength()) {
                caret.moveToOffset(this.document.getTotalDocumentLength());
            }
            this.document.getUndoRedoStack().onReplaced(this.getPrimaryCaret(), old, range, deleted, text);
        });


        this.view.triggerRepaint();
    }

    deleteWholeLine(caret: Caret) {
        let lineNum = this.document.getLineAt(caret.getOffset()).getLineNumber();
        let start = this.document.getLineStart(caret.getOffset());
        let end = this.document.getLineEnd(caret.getOffset());

        this.deleteAt(lineNum === 0 ? start : start - 1, end - start + 1);
        this.view.resetBlink();
    }

    deleteAt(offset: Offset, n: number = 1) {
        if (offset < 0 || offset >= this.document.getTotalDocumentLength()) {
            return;
        }

        // Delete the character at the specified offset
        const deleted = this.document.deleteAt(offset, n);
        this.document.getUndoRedoStack().onDeleted(this.getPrimaryCaret(), offset, deleted);

        this.view.triggerRepaint();
    }

    deleteSelection(caret: Caret) {
        let selection = caret.getSelectionModel();
        if (!selection.isSelectionActive) return;

        let start = selection.getActualStart();

        this.deleteAt(start, selection.getSelectionLength());
        caret.moveToOffset(start);
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
        ModifierKeyHolder.getInstance().set(event);

        KeybindManager.getInstance().onKeydown(KeybindContext.fromEditor(this, event));
        this.eventBus.syncPublish(new KeyPressedEvent(this, event));
    }

    onMouseDown(event: MouseEvent) {
        ModifierKeyHolder.getInstance().set(event);

        this.caretModel.removeAll();
        this.moveCaretToMouseEvent(event);

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
        if (!this.eventBus.publishCancellable(new MouseMovedEvent(this, event))) return;

        if (ModifierKeyHolder.isMouseDown()) {
            ModifierKeyHolder.getInstance().setIsDragging(true);
            this.moveCaretToMouseEvent(event);
        }
    }

    onType(event: InputEvent) {
        ModifierKeyHolder.getInstance().clear();
        if (event.data) {
            this.type(event.data);
        }
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

    repaintView() {
        this.view.triggerRepaint();
    }
}