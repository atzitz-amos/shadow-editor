import {View} from "./ui/view/View";
import {Project} from "./core/project/Project";
import {ProjectFile} from "./core/project/File";
import {EditorProperties} from "./Properties";
import {TextContext, TextRange} from "./core/coordinate/TextRange";
import {Caret, CaretModel} from "./core/caret/Caret";
import {Key, ModifierKeyHolder} from "./core/events/Keybind";

import {HTMLUtils} from "./utils/HTMLUtils";
import {EditorInstance} from "./EditorInstance";
import {TokenStream} from "./lang/tokens/TokenStream";
import {Document} from "./core/document/Document";
import {WidgetManager} from "./core/components/WidgetManager";
import {LogicalPosition} from "./core/coordinate/LogicalPosition";
import {VisualPosition} from "./core/coordinate/VisualPosition";
import {XYPoint} from "./core/coordinate/XYPoint";
import {EditorCoordinateMapper} from "./core/coordinate/EditorCoordinateMapper";
import {InlayManager} from "./core/inlay/InlayManager";
import {ProcessManager} from "./core/processManager/ProcessManager";
import {PluginManager} from "./plugins/PluginManager";
import {EditorPlugin} from "./plugins/loader/Plugin";
import {LanguageBase} from "./lang/LanguageBase";
import {ASTBuilder} from "./lang/ast/builder/ASTBuilder";
import JsLang from "../plugins/jsLang/lang/JsLang";
import {ASTNode} from "./lang/ast/nodes/ASTNode";
import {LangSupport} from "./core/lang/LangSupport";
import {LangService} from "./core/lang/LangService";
import {EventBus} from "./core/events/EventBus";
import {KeybindManager} from "./core/events/KeybindManager";
import {EditorAttachedEvent} from "./events/EditorAttachedEvent";
import {KeyPressedEvent, KeyReleasedEvent, MousePressedEvent, MouseReleasedEvent} from "./events/PhysicalEvents";
import {InlayWidget} from "./ui/inline/inlay/InlayWidget";

export class Editor {
    static ID = 0;

    id: number;
    properties: EditorProperties;

    file: ProjectFile;
    project: Project;

    view: View;
    root: HTMLElement;

    document: Document;
    langService: LangService;
    widgetManager: WidgetManager;

    inlayManager: InlayManager;
    coordinateMapper: EditorCoordinateMapper;

    caretModel: CaretModel;

    processManager: ProcessManager;
    keybindManager: KeybindManager;
    eventBus: EventBus;

    langSupport: LangSupport;
    pluginManager: PluginManager;

    perfCheckRunning: boolean = false;

    private renderingProcess: any;

    constructor(project?: Project | null, options?: EditorProperties) {
        this.id = Editor.ID++;

        this.properties = options || {};

        this.file = this.properties.file || new ProjectFile('temp.js', '');
        if (project) project.addFile(this.file);

        // TODO
        this.file.setLanguage(JsLang.class);

        this.project = project || Project.singleFileProject(this.file);

        this.eventBus = new EventBus('editor.bus');
        this.keybindManager = new KeybindManager(this);

        this.document = new Document(this, this.file);
        this.langService = new LangService(this);
        this.widgetManager = new WidgetManager(this);

        this.langService.setCurrentLanguage(JsLang.class);

        this.view = new View(this);

        this.inlayManager = new InlayManager(this);
        this.coordinateMapper = new EditorCoordinateMapper(this.view);

        this.caretModel = new CaretModel(this);

        this.processManager = new ProcessManager();

        this.langSupport = new LangSupport();
        this.pluginManager = new PluginManager(this);
        this.pluginManager.loadAll();

        this.renderingProcess = setInterval(() => {
            EditorInstance.with(this, () => {
                this.view.render();
            });
        }, 20);
    }

    attach(element: HTMLElement) {
        // We assume plugins have loaded by now, so we can finally parse the file content
        EditorInstance.with(this, () => {
            this.root = HTMLUtils.createElement('div.editor', element) as HTMLDivElement;
            this.view.onAttached(this, this.root);

            this.eventBus.syncPublish(new EditorAttachedEvent(this, this.root));
        });

    }

    enable(plugin: Class<EditorPlugin>) {
        this.pluginManager.enable(plugin);
    }

    disable(plugin: Class<EditorPlugin>) {
        this.pluginManager.enable(plugin);
    }

    /**
     +--------------------------+
     |           Data           |
     +--------------------------+    */
    getEventBus(): EventBus {
        return this.eventBus;
    }

    getKeybindManager(): KeybindManager {
        return this.keybindManager;
    }

    getProject(): Project {
        return this.project;
    }

    getOpenedFile(): ProjectFile {
        return this.file;
    }

    getOpenedDocument(): Document {
        return this.document;
    }

    getCurrentLanguage(): LanguageBase | null {
        return this.file.getLanguage();
    }

    getLangSupport() {
        return this.langSupport;
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

    getProcessManager(): ProcessManager {
        return this.processManager;
    }

    getPluginManager(): PluginManager {
        return this.pluginManager;
    }

    getInlayManager(): InlayManager {
        return this.inlayManager;
    }

    parse(stream: TokenStream): ASTNode[] {
        const builder = new ASTBuilder(stream);
        const parser = this.langService.makeParser(builder)!;  // TODO: handle no parser
        parser.parse();
        return builder.getProduction();
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
        EditorInstance.with(this, () => {
            this.caretModel.forEachCaret(caret => {
                if (caret.getSelectionModel().isSelectionActive) {
                    this.deleteSelection(caret);
                }

                this.insertText(caret.getOffset(), char)
                caret.shiftRight(false);
                caret.refresh();
                this.view.resetBlink();
            });
        });
    }

    invalidate(ctx: TextContext) {
        // TODO
        // ctx.scope.clear();
        // this.inlayManager.clear();
    }

    insertText(offset: Offset, text: string) {
        // Insert the text at the specified offset
        this.document.insertText(offset, text);

        // Get the current lexer and highlighter
        // const lexer = this.langService.getLexer();
        // const highlighter = this.langService.createHighlighter()

        // Get the context that should be updated
        let ctx = this.document.getAssociatedContext(offset);
        this.invalidate(ctx);

        // Reparse the context with the new text
        // let tokens = lexer.asTokenStream(ctx.text);
        // let nodes = this.parse(ctx.scope, tokens.clone()).children;
        // this.document.getSrTree().patch(
        //     ctx.containingNode,
        //     nodes,
        // );

        // Perform syntax highlighting on the tokens
        // let highlightedTokens = highlighter.highlightAll(tokens.clone());
        // this.componentManager.setRange(this.getFullRange(), highlightedTokens);

        // this.fire('onHighlightingPerformed', this.getFullRange(), highlightedTokens);
        //this.fireLangEvent("onSrLoaded", ctx, nodes, tokens);

        // const builder = new ASTBuilder(tokens.clone());
        // this.createParser(builder).parse();
        // console.log(builder);

        this.view.triggerRepaint();
    }

    deleteAt(offset: Offset, n: number = 1) {
        if (offset < 0 || offset >= this.document.getTotalDocumentLength()) {
            return;
        }

        // Delete the character at the specified offset
        const deleted = this.document.deleteAt(offset, n);

        // Get the current lexer and highlighter
        // let lexer = this.getCurrentLexer();
        // let highlighter = this.getIncrementalHighlighter();

        // Get the context that should be updated
        let ctx = this.document.getAssociatedContext(offset);
        this.invalidate(ctx);

        // Reparse the context with the new text
        // let stream = lexer.asTokenStream(ctx.text);
        // let nodes = this.parse(ctx.scope, tokens.clone()).children;
        // this.document.getSrTree().patch(
        //     ctx.containingNode,
        //     nodes,
        // );

        // Perform syntax highlighting on the tokens
        // let highlightedTokens = highlighter.highlightAll(stream.clone());
        // this.componentManager.setRange(this.getFullRange(), highlightedTokens);

        // this.fire('onHighlightingPerformed', this.getFullRange(), highlightedTokens);
        //this.fireLangEvent("onSrLoaded", ctx, nodes, tokens);

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

        this.keybindManager.onKeydown(event);
        this.eventBus.syncPublish(new KeyPressedEvent(this, event));
    }

    onMouseDown(event: MouseEvent) {
        ModifierKeyHolder.getInstance().set(event);

        this.caretModel.removeAll();
        this.moveCursorToMouseEvent(event);

        this.keybindManager.onMousedown(event);
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
            EditorInstance.with(this, () => {
                this.view.render();
            });
        }, 20);
    }
}