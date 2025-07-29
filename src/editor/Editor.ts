import {View} from "./ui/View";
import {Project} from "./project/Project";
import {ProjectFile} from "./project/File";
import {Plugin, PluginManager} from "./plugins/Plugins"
import {EditorProperties} from "./Properties";
import {EditorData} from "./core/data/data";
import {RawEditorData} from "./core/data/raw";
import {
    AbstractVisualEventListener,
    EditorEventListener,
    EventArgs,
    EventManager,
    GeneralEvent,
    ListenerType,
    VisualEventListener
} from "./core/events/events";
import {Position, PositionTuple, TextRange} from "./core/Position";
import {OffsetManager} from "./core/OffsetManager";
import {CaretModel} from "./core/Caret";
import {Key, Keybind} from "./core/events/keybind";

import {DefaultLexer} from "./lang/default/Lexer";
import {DefaultHighlighter} from "./lang/default/Highlighter";
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
    private readonly defaultHighlighter = new DefaultHighlighter();

    constructor(project?: Project, options?: EditorProperties) {
        super();

        this.id = Editor.ID++;

        this.properties = options || {};

        this.file = this.properties.file || new ProjectFile('temp', '', 'js');
        if (project) project.addFile(this.file);

        this.project = project || Project.singleFileProject(this.file);

        this.eventsManager = new EventManager();
        this.eventsManager.addVisualEventListener(this);

        this.data = new EditorData(this.file.read());
        this.data.setLanguage(this.file.type);

        this.view = new View(this);
        this.offsetManager = new OffsetManager(this.data);
        this.caretModel = new CaretModel(this);

        this.actions = new Actions(this);
        this.plugins = new PluginManager(this);

        setInterval(() => {
            EditorInstance.with(this, () => {
                this.view.render();
            });
        }, 20);

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

    fireKeybinding(keyboardEvent: KeyboardEvent) {
        EditorInstance.with(this, () => this.eventsManager.fireKeybinding(keyboardEvent, this));
    }

    registerPlugin(plugin: Plugin) {
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
        this.caretModel.clearAll();
        this.caretModel.primary.moveToLogical(logical);

        this.view.resetBlink();
    }

    type(char: string) {
        EditorInstance.with(this, () => {
            this.caretModel.forEachCaret(caret => {
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
        this.data.srTree.patch(
            ctx.containingNode,
            this.parse(ctx.scope, tokens).children,
        );

        // Perform syntax highlighting on the tokens
        let highlightedTokens = highlighter.highlight(tokens);
        this.data.setComponentsAtRange(ctx.scope.range, highlightedTokens);
    }

    deleteAt(offset: Offset) {
        if (offset < 0 || offset >= this.data.raw.length()) {
            return;
        }

        // Delete the character at the specified offset
        let char = this.data.raw.delete(offset, 1);

        // Update the offsets of all ranges in the editor and recompute new line breaks
        this.offsetManager.offset(offset, -1);
        if (char === '\n') {
            let index = this.offsetManager.lineBreaks.indexOf(offset);
            if (index !== -1) {
                this.offsetManager.lineBreaks.splice(index, 1);
            }
        }

        // Get the current lexer and highlighter
        let lexer = this.getCurrentLexer();
        let highlighter = this.getCurrentHighlighter();

        // Get the context that should be updated
        let ctx = this.data.withContext(offset);
        ctx.scope.clear();

        // Reparse the context with the new text
        let tokens = lexer.asTokenStream(ctx.text);
        this.data.srTree.patch(
            ctx.containingNode,
            this.parse(ctx.scope, tokens).children,
        );

        // Perform syntax highlighting on the tokens
        let highlightedTokens = highlighter.highlight(tokens);
        this.data.setComponentsAtRange(ctx.scope.range, highlightedTokens);
    }

    take(n: number, from: number) {
        return this.data.take(n, from, this.offsetManager.lineBreaks);
    }

    getLine(line: number): HTMLSpanElement[] {
        return this.data.getLine(line, this.offsetManager.lineBreaks);
    }

    getLineCount() {
        return this.offsetManager.lineBreaks.length;
    }

    getLineLength(line: number) {
        let start = this.offsetManager.lineBreaks[line];
        let end = this.offsetManager.lineBreaks[line + 1] - 1 || this.data.raw.length();
        return end - start;
    }

    /**
     +---------------------------+
     |      Event Listeners      |
     +---------------------------+    */

    onKeyDown(editor: Editor, event: KeyboardEvent) {
        if (event.key === Key.ENTER) {
            return this.type('\n');
        }
        this.fireKeybinding(event);
    }

    onMouseDown(editor: Editor, event: MouseEvent) {
        this.moveCursorToMouseEvent(event);
    }

    onMouseUp(editor: Editor, event: MouseEvent) {

    }

    onMouseMove(editor: Editor, event: MouseEvent) {

    }

    onInput(editor: Editor, event: InputEvent) {
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
}