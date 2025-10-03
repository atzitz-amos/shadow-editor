import {View} from "./ui/View";
import {Project} from "./project/Project";
import {ProjectFile} from "./project/File";
import {IPlugin, PluginManager} from "./plugins/Plugins"
import {EditorProperties} from "./Properties";
import {
    AbstractVisualEventListener,
    EditorEventListener,
    EventArgs,
    EventManager,
    GeneralEvent,
    LangEvent,
    LangEventArgs,
    LangEventListener,
    ListenerType,
    VisualEventListener
} from "./core/events/events";
import {TextContext, TextRange} from "./core/coordinate/TextRange";
import {Caret, CaretModel} from "./core/Caret";
import {Key, Keybind, ModifierKeyHolder} from "./core/events/keybind";

import {DefaultLexer} from "./lang/default/Lexer";
import {HTMLUtils} from "./utils/HTMLUtils";
import {ILexer} from "./core/lang/lexer/ILexer";
import {IParser} from "./core/lang/parser/IParser";
import {IHighlighter} from "./core/lang/highlighter/IHighlighter";
import {EditorInstance} from "./EditorInstance";
import {TokenStream} from "./core/lang/lexer/TokenStream";
import {SRCodeBlock} from "./core/lang/parser/ast";
import {IScope} from "./core/lang/Scoping";
import {Actions} from "./core/actions/Actions";
import {InlineError} from "./ui/components/inline/InlineError";
import {Popup} from "./ui/components/inline/popup/Popup";
import {Document} from "./core/document/Document";
import {EditorComponentsManager} from "./core/components/EditorComponentsManager";
import {InlineComponent} from "./core/components/InlineComponent";
import {LogicalPosition} from "./core/coordinate/LogicalPosition";
import {VisualPosition} from "./core/coordinate/VisualPosition";
import {XYPoint} from "./core/coordinate/XYPoint";
import {EditorCoordinateMapper} from "./core/coordinate/EditorCoordinateMapper";
import {InlayManager} from "./core/inlay/InlayManager";
import {InlayComponent} from "./ui/components/inline/inlays/InlayComponent";

export class Editor extends AbstractVisualEventListener {
    static ID = 0;

    id: number;
    properties: EditorProperties;

    file: ProjectFile;
    project: Project;

    view: View;
    root: HTMLElement;

    document: Document;
    componentManager: EditorComponentsManager;

    inlayManager: InlayManager;
    coordinateMapper: EditorCoordinateMapper;

    caretModel: CaretModel;
    eventsManager: EventManager;

    actions: Actions;
    plugins: PluginManager;

    perfCheckRunning: boolean = false;

    private readonly defaultLexer = new DefaultLexer();
    private readonly defaultHighlighter;  // TODO

    private renderingProcess: any;

    constructor(project?: Project | null, options?: EditorProperties) {
        super();

        this.id = Editor.ID++;

        this.properties = options || {};

        this.file = this.properties.file || new ProjectFile('temp', '', 'js');
        if (project) project.addFile(this.file);

        this.project = project || Project.singleFileProject(this.file);

        this.eventsManager = new EventManager();
        this.eventsManager.addVisualEventListener(this);

        this.document = new Document(this, this.file);
        this.componentManager = new EditorComponentsManager(this);

        this.view = new View(this);

        this.inlayManager = new InlayManager(this);
        this.coordinateMapper = new EditorCoordinateMapper(this.view);

        this.caretModel = new CaretModel(this);

        this.actions = new Actions(this);
        this.plugins = new PluginManager(this);

        this.renderingProcess = setInterval(() => {
            EditorInstance.with(this, () => {
                this.view.render();
            });
        }, 20);

    }

    get lang(): string {
        return this.document.getLanguage();
    }

    attach(element: HTMLElement) {
        // We assume plugins have loaded by now, so we can finally parse the file content
        EditorInstance.with(this, () => {
            this.root = HTMLUtils.createElement('div.editor', element) as HTMLDivElement;
            this.view.onAttached(this, this.root);

            this.fire('onAttached', this.root);
        });

    }

    fire<event extends GeneralEvent>(event: event, ...args: EventArgs<event>): void {
        EditorInstance.with(this, () => this.eventsManager.fire(event, this, ...args));
    }

    fireLangEvent<event extends LangEvent>(event: event, ...args: LangEventArgs<event>) {
        this.eventsManager.fireLangEvent(this.lang, event, this, ...args);
    }

    fireKeybinding(keyboardEvent: KeyboardEvent) {
        EditorInstance.with(this, () => this.eventsManager.fireKeybinding(keyboardEvent, this));
    }

    fireMouseKeybinding(mouseEvent: MouseEvent) {
        EditorInstance.with(this, () => this.eventsManager.fireMouseKeybinding(mouseEvent, this));
    }

    registerPlugin(plugin: IPlugin) {
        EditorInstance.with(this, () => {
            this.plugins.register(plugin);
        });
    }

    addVisualEventListener(listener: VisualEventListener) {
        this.eventsManager.addVisualEventListener(listener);
    }

    addEditorEventListener(listener: EditorEventListener) {
        this.eventsManager.addEditorEventListener(listener);
    }

    addLangEventListener(lang: string, listener: LangEventListener) {
        this.eventsManager.addLangEventListener(lang, listener);
    }

    removeVisualEventListener(listener: VisualEventListener) {
        this.eventsManager.removeVisualEventListener(listener);
    }

    registerKeybinding(keybinding: Keybind, listener: ListenerType) {
        this.eventsManager.addKeybindingListener(keybinding, listener);
    }

    registerComponentKeybind(component: InlineComponent, keybinding: Keybind, listener: ListenerType) {
        this.eventsManager.addConditionalEventListener(
            keybinding,
            listener,
            (editor, event) => {
                return component.getRenderedView()?.isInBound(event.clientX, event.clientY)!;
            });
    }

    /**
     +--------------------------+
     |           Data           |
     +--------------------------+    */
    getOpenedDocument(): Document {
        return this.document;
    }

    getComponentManager(): EditorComponentsManager {
        return this.componentManager;
    }

    getCaretModel() {
        return this.caretModel;
    }

    getPrimaryCaret() {
        return this.caretModel.getPrimary();
    }

    getLexerForFileType(fileType: string): ILexer<any> {
        return this.plugins.getLexerForFileType(fileType) || this.defaultLexer;
    }

    getHighlighterForFileType(fileType: string): IHighlighter<any> {
        return this.plugins.getHighlighterForFileType(fileType) || this.defaultHighlighter;
    }

    getParserForFileType(fileType: string): IParser<any> {
        // TODO: Default parser
        return this.plugins.getParserForFileType(fileType)!;
    }

    getCurrentLexer(): ILexer<any> {
        return this.getLexerForFileType(this.document.getLanguage());
    }

    getCurrentHighlighter(): IHighlighter<any> {
        return this.getHighlighterForFileType(this.document.getLanguage());
    }

    getCurrentParser(): IParser<any> {
        return this.getParserForFileType(this.document.getLanguage());
    }

    getInlayManager(): InlayManager {
        return this.inlayManager;
    }

    parse(scope: IScope, tokens: TokenStream<any>): SRCodeBlock {
        return this.getCurrentParser().parse(scope, tokens);
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
        return TextRange.tracked(0, this.document.getTotalDocumentLength());
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
        ctx.scope.clear();
        this.inlayManager.clear();
    }

    insertText(offset: Offset, text: string) {
        // Insert the text at the specified offset
        this.document.insertText(offset, text);

        // Get the current lexer and highlighter
        let lexer = this.getCurrentLexer();
        let highlighter = this.getCurrentHighlighter()

        // Get the context that should be updated
        let ctx = this.document.getAssociatedContext(offset);
        this.invalidate(ctx);

        // Reparse the context with the new text
        let tokens = lexer.asTokenStream(ctx.text);
        let nodes = this.parse(ctx.scope, tokens.clone()).children;
        this.document.getSrTree().patch(
            ctx.containingNode,
            nodes,
        );

        // Perform syntax highlighting on the tokens
        let highlightedTokens = highlighter.highlight(tokens);
        this.componentManager.setRange(ctx.scope.range, highlightedTokens);

        this.fire('onInsertedText', offset, text);
        this.fireLangEvent("onSrLoaded", ctx, nodes, tokens);

        this.view.triggerRepaint();
    }

    deleteAt(offset: Offset, n: number = 1) {
        if (offset < 0 || offset >= this.document.getTotalDocumentLength()) {
            return;
        }

        // Delete the character at the specified offset
        const deleted = this.document.deleteAt(offset, n);

        // Get the current lexer and highlighter
        let lexer = this.getCurrentLexer();
        let highlighter = this.getCurrentHighlighter();

        // Get the context that should be updated
        let ctx = this.document.getAssociatedContext(offset);
        this.invalidate(ctx);

        // Reparse the context with the new text
        let tokens = lexer.asTokenStream(ctx.text);
        let nodes = this.parse(ctx.scope, tokens.clone()).children;
        this.document.getSrTree().patch(
            ctx.containingNode,
            nodes,
        );

        // Perform syntax highlighting on the tokens
        this.componentManager.setRange(ctx.scope.range, highlighter.highlight(tokens.clone()));

        this.fire('onDeletedText', offset, deleted);
        this.fireLangEvent("onSrLoaded", ctx, nodes, tokens);

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

    addErrorAt(range: TextRange, type: string, value: string, msg: string) {
        this.componentManager.addError(new InlineError(range, type, value, msg));
    }

    addInlay(element: InlayComponent) {
        this.inlayManager.addInlay(element.toInlayRecord(this.view));
        this.componentManager.add(element);
        this.view.triggerRepaint();
    }

    openPopup(sourceX: number, sourceY: number, popup: Popup) {
        if (!popup.isRendered) {
            this.view.addPopup(popup);
        }
        if (!popup.isShown) {
            this.view.showPopup(popup, sourceX, sourceY);
        }
    }

    /**
     +---------------------------+
     |      Event Listeners      |
     +---------------------------+    */

    onKeyUp(editor: Editor, event: KeyboardEvent) {
        ModifierKeyHolder.getInstance().set(event);
    }

    onKeyDown(editor: Editor, event: KeyboardEvent) {
        if (event.key === Key.ENTER) {
            ModifierKeyHolder.getInstance().clear();
            return this.type('\n');
        }
        ModifierKeyHolder.getInstance().set(event);
        this.fireKeybinding(event);
    }

    onMouseDown(editor: Editor, event: MouseEvent) {
        ModifierKeyHolder.getInstance().set(event);

        this.caretModel.removeAll();
        this.moveCursorToMouseEvent(event);

        this.fireMouseKeybinding(event);
    }

    onMouseUp(editor: Editor, event: MouseEvent) {
        ModifierKeyHolder.getInstance().set(event);
        ModifierKeyHolder.getInstance().setIsDragging(false);
        ModifierKeyHolder.getInstance().isMouseDown = false;
    }

    onMouseMove(editor: Editor, event: MouseEvent) {
        if (ModifierKeyHolder.isMouseDown) {
            ModifierKeyHolder.getInstance().setIsDragging(true);
            this.moveCursorToMouseEvent(event);
        }
    }

    onInput(editor: Editor, event: InputEvent) {
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