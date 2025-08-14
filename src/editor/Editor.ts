import {View} from "./ui/View";
import {Project} from "./project/Project";
import {ProjectFile} from "./project/File";
import {IPlugin, PluginManager} from "./plugins/Plugins"
import {EditorProperties} from "./Properties";
import {EditorData} from "./core/data/data";
import {RawEditorData} from "./core/data/raw";
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
import {Position, PositionTuple, TextRange} from "./core/Position";
import {OffsetManager} from "./core/OffsetManager";
import {Caret, CaretModel} from "./core/Caret";
import {Key, Keybind, ModifierKeyHolder} from "./core/events/keybind";

import {DefaultLexer} from "./lang/default/Lexer";
import {HTMLUtils} from "./utils/HTMLUtils";
import {SRTree} from "./core/lang/parser/SRTree";
import {ILexer} from "./core/lang/lexer/ILexer";
import {IParser} from "./core/lang/parser/IParser";
import {IHighlighter} from "./core/lang/highlighter/IHighlighter";
import {EditorInstance} from "./EditorInstance";
import {TokenStream} from "./core/lang/lexer/TokenStream";
import {SRCodeBlock} from "./core/lang/parser/ast";
import {IScope} from "./core/lang/Scoping";
import {Actions} from "./core/actions/Actions";
import {EDAC} from "./core/data/edac";
import {InlineError} from "./ui/components/inline/InlineError";
import {Popup} from "./ui/components/inline/popup/Popup";

export class Editor extends AbstractVisualEventListener {
    static ID = 0;

    id: number;
    properties: EditorProperties;

    file: ProjectFile;
    project: Project;

    view: View;
    root: HTMLElement;

    data: EditorData;
    caretModel: CaretModel;
    offsetManager: OffsetManager;
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

        this.data = new EditorData(this, this.file.read());
        this.data.setLanguage(this.file.type);

        this.view = new View(this);
        this.offsetManager = new OffsetManager(this.data);

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
        return this.data.language;
    }

    attach(element: HTMLElement) {
        // We assume plugins have loaded by now, so we can finally parse the file content
        EditorInstance.with(this, () => {
            this.data.srTree = new SRTree(
                this.getParserForFileType(this.data.language),
                this.getLexerForFileType(this.data.language).asTokenStream(this.data.text)
            );

            this.root = HTMLUtils.createElement('div.editor', element) as HTMLDivElement;
            this.view.onAttached(this, this.root);

            this.fire('onAttached', this.root);
        });

    }

    fire<event extends GeneralEvent>(event: event, ...args: EventArgs<event>): void {
        EditorInstance.with(this, () => this.eventsManager.fire(event, this, ...args));
    }

    fireLangEvent<event extends LangEvent>(event: event, ...args: LangEventArgs<event>) {
        EditorInstance.with(this, () => this.eventsManager.fireLangEvent(this.lang, event, this, ...args));
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

    /**
     +--------------------------+
     |           Data           |
     +--------------------------+    */
    getRawData(): RawEditorData {
        return this.data.raw;
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
        return this.getLexerForFileType(this.data.language);
    }

    getCurrentHighlighter(): IHighlighter<any> {
        return this.getHighlighterForFileType(this.data.language);
    }

    getCurrentParser(): IParser<any> {
        return this.getParserForFileType(this.data.language);
    }

    parse(scope: IScope, tokens: TokenStream<any>): SRCodeBlock {
        return this.getCurrentParser().parse(scope, tokens.clone());
    }

    /**
     +--------------------------+
     |         Position         |
     +--------------------------+    */

    public offsetToLogical(offset: number): PositionTuple {
        if (offset < 0) offset = 0;
        else if (offset > this.data.raw.length()) offset = this.data.raw.length() - 1;

        return this.offsetManager.offsetToLogical(offset);
    }

    public absoluteToOffset(x: number, y: number): Offset {
        return this.offsetManager.calculateOffset(this.offsetManager.absoluteToLogical(new PositionTuple(x, y)));
    }

    public offsetToAbsolute(offset: Offset): PositionTuple {
        return this.offsetManager.logicalToAbsolute(this.offsetToLogical(offset));
    }

    public calculateOffset(logical: PositionTuple): number {
        return this.offsetManager.calculateOffset(logical);
    }

    /**
     * Convert page XY to logical coords. The XY coords must be relative to the layers div on the page.
     * @returns The logical position */
    public visualToNearestLogical(x: number, y: number): PositionTuple {
        const charSize = this.view.getCharSize();
        const lineHeight = this.view.getLineHeight();

        const scrollXChars = this.view.scroll.scrollXOffset === 0 ? this.view.scroll.scrollXChars : this.view.scroll.scrollXChars - 1;
        const scrollYLines = this.view.scroll.scrollYOffset === 0 ? this.view.scroll.scrollYLines : this.view.scroll.scrollYLines - 1;

        const logicalX = Math.round((x + this.view.scroll.scrollXOffset) / charSize) + scrollXChars;
        const logicalY = Math.floor((y + this.view.scroll.scrollYOffset) / lineHeight) + scrollYLines;

        return new PositionTuple(logicalX, logicalY);
    }

    public logicalToVisual(logical: PositionTuple): PositionTuple {
        const charSize = this.view.getCharSize();
        const lineHeight = this.view.getLineHeight();

        const scrollYLines = this.view.scroll.scrollYOffset === 0 ? this.view.scroll.scrollYLines : this.view.scroll.scrollYLines - 1;

        const visualX = (logical.x - this.view.scroll.scrollXChars) * charSize - this.view.scroll.scrollXOffset;
        const visualY = (logical.y - scrollYLines) * lineHeight - this.view.scroll.scrollYOffset;

        return new PositionTuple(visualX, visualY);
    }

    createLogical(x: number, y: number) {
        return Position.fromLogical(this, x, y);
    }

    createAbsolutePosition(x: number, y: number) {
        return Position.fromAbsolute(this, x, y);
    }

    createPositionFromOffset(offset: number) {
        return Position.fromOffset(this, offset);
    }

    createVisualPosition(x: number, y: number) {
        return Position.fromVisual(this, x, y);
    }


    getFullRange() {
        return new TextRange(0, this.data.raw.length());
    }

    isValidOffset(offset: Offset): boolean {
        return offset >= 0 && offset <= this.data.raw.length();
    }

    /**
     +---------------------------+
     |           Logic           |
     +---------------------------+    */

    moveCursorToMouseEvent(event: MouseEvent) {
        let [x, y] = this.view.getRelativePos(event);
        let logical = this.visualToNearestLogical(x, y);

        if (logical.y < 0) logical.y = 0;
        else if (logical.y >= this.getLineCount()) logical.y = this.getLineCount() - 1;

        logical.x = Math.max(0, Math.min(logical.x, this.getLineLength(logical.y)));
        this.caretModel.primary.moveToLogical(logical);

        this.view.resetBlink();
    }

    type(char: string) {
        EditorInstance.with(this, () => {
            this.caretModel.forEachCaret(caret => {
                if (caret.selectionModel.isSelectionActive) {
                    this.deleteSelection(caret);
                }

                this.insertText(caret.position.toOffset(), char)
                caret.shift();
                this.view.resetBlink();
            });
        });
    }

    insertText(offset: Offset, text: string) {
        // Insert the text at the specified offset
        this.data.raw.insert(offset, text);

        // Update the offsets of all ranges in the editor and recompute new line breaks
        this.offsetManager.offset(offset, text.length);
        this.offsetManager.recomputeNewLines(offset, text);

        // Get the current lexer and highlighter
        let lexer = this.getCurrentLexer();
        let highlighter = this.getCurrentHighlighter()

        // Get the context that should be updated
        let ctx = this.data.withContext(offset);
        ctx.scope.clear();

        // Reparse the context with the new text
        let tokens = lexer.asTokenStream(ctx.text);
        let nodes = this.parse(ctx.scope, tokens).children;
        this.data.srTree.patch(
            ctx.containingNode,
            nodes,
        );

        // Perform syntax highlighting on the tokens
        let highlightedTokens = highlighter.highlight(tokens);
        this.data.setComponentsAtRange(ctx.scope.range, highlightedTokens);

        this.fireLangEvent("onSrLoaded", ctx, nodes, tokens);

        this.view.triggerRepaint();
    }

    deleteAt(offset: Offset, n: number = 1) {
        if (offset < 0 || offset >= this.data.raw.length()) {
            return;
        }

        // Delete the character at the specified offset
        let text = this.data.raw.delete(offset, n);

        // Update the offsets of all ranges in the editor and recompute new line breaks
        this.offsetManager.recomputeNewLines(offset, text, true);
        this.offsetManager.offset(offset, -n);

        // Get the current lexer and highlighter
        let lexer = this.getCurrentLexer();
        let highlighter = this.getCurrentHighlighter();

        // Get the context that should be updated
        let ctx = this.data.withContext(offset);
        ctx.scope.clear();

        // Reparse the context with the new text
        let tokens = lexer.asTokenStream(ctx.text);
        let nodes = this.parse(ctx.scope, tokens).children;
        this.data.srTree.patch(
            ctx.containingNode,
            nodes,
        );

        // Perform syntax highlighting on the tokens
        this.data.setComponentsAtRange(ctx.scope.range, highlighter.highlight(tokens.clone()));

        this.fireLangEvent("onSrLoaded", ctx, nodes, tokens);

        this.view.triggerRepaint();
    }

    deleteSelection(caret: Caret) {
        let selection = caret.selectionModel;
        if (!selection.isSelectionActive) return;

        let start = selection.getStart().toOffset();
        let end = selection.getEnd().toOffset();

        this.deleteAt(start, end - start);

        caret.moveToLogical(Position.fromOffset(this, start));
    }

    take(n: number, from: number): EDAC[] {
        return this.data.take(n, from, this.offsetManager.lineBreaks);
    }

    getLine(line: number): EDAC {
        return this.data.getLine(line, this.offsetManager.lineBreaks);
    }

    getLineCount() {
        return this.offsetManager.lineBreaks.length;
    }

    getLineLength(line: number) {
        let start = this.offsetManager.lineBreaks[line];
        let end = (line + 1 < this.offsetManager.lineBreaks.length) ? (this.offsetManager.lineBreaks[line + 1] - 1) : this.data.raw.length();
        return end - start;
    }

    getWordAt(at: Offset, sep: RegExp = /\s/): TextRange {
        return this.data.getWordAt(at, sep, this.offsetManager);
    }

    /**
     +-----------------------+
     |       Components      |
     +-----------------------+    */

    addErrorAt(range: TextRange, type: string, value: string, msg: string) {
        this.data.registerError(new InlineError(range, type, value, msg));
    }

    openPopup(sourceX: number, sourceY: number, popup: Popup) {
        if (!popup.isRendered) {
            this.view.renderPopup(popup);
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