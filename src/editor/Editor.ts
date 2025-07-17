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
    EventManager,
    GeneralEvent,
    ListenerType,
    VisualEventListener
} from "./core/events/events";
import {Position, PositionTuple} from "./core/Position";
import {OffsetManager} from "./core/OffsetManager";
import {CaretModel} from "./core/Caret";
import {Keybinding} from "./core/events/keybinding";

import {createElement} from "./utils";
import {DefaultLexer} from "./lang/default/Lexer";
import {DefaultHighlighter} from "./lang/default/Highlighter";

export class Editor extends AbstractVisualEventListener {
    properties: EditorProperties;

    file: ProjectFile;
    project: Project;

    view: View;
    root: HTMLElement;

    data: EditorData;
    caretModel: CaretModel;
    offsetManager: OffsetManager;
    eventsManager: EventManager;
    plugins: PluginManager;

    private readonly defaultLexer = new DefaultLexer();
    private readonly defaultHighlighter = new DefaultHighlighter();

    constructor(project?: Project, options?: EditorProperties) {
        super();

        this.properties = options || {};

        this.file = this.properties.file || new ProjectFile('temp', '', 'plaintext');
        if (project) project.addFile(this.file);

        this.project = project || Project.singleFileProject(this.file);

        this.eventsManager = new EventManager();
        this.eventsManager.addVisualEventListener(this);

        this.data = new EditorData(this.file.read());
        this.data.setLanguage(this.file.type);

        this.view = new View(this);
        this.caretModel = new CaretModel(this);
        this.offsetManager = new OffsetManager(this.data);
        this.plugins = new PluginManager(this);
    }

    attach(element: HTMLElement) {
        this.root = createElement('div.editor', element) as HTMLDivElement;
        this.view.onAttached(this, this.root);

        this.fire('onAttached', this, this.root);
    }

    fire(event: GeneralEvent, ...args: any[]) {
        this.eventsManager.fire(event, this, ...args);
    }

    fireKeybinding(keyboardEvent: KeyboardEvent) {
        this.eventsManager.fireKeybinding(keyboardEvent, this);
    }

    registerPlugin(plugin: Plugin) {
        this.plugins.register(plugin);
        plugin.onRegistered(this.plugins);
    }

    addVisualEventListener(listener: VisualEventListener) {
        this.eventsManager.addVisualEventListener(listener);
    }

    addEditorEventListener(listener: EditorEventListener) {
        this.eventsManager.addEditorEventListener(listener);
    }

    registerKeybinding(keybinding: Keybinding, listener: ListenerType) {
        this.eventsManager.addKeybindingListener(keybinding, listener);
    }


    /**
     +--------------------------+
     |           Data           |
     +--------------------------+    */
    getRawData(): RawEditorData {
        return this.data.raw;
    }

    /**
     +--------------------------+
     |         Position         |
     +--------------------------+    */

    public offsetToLogical(offset: number): PositionTuple {
        return this.offsetManager.offsetToLogical(offset);
    }

    public absoluteToLogical(x: number, y: number): PositionTuple {
        return this.offsetManager.absoluteToLogical(new PositionTuple(x, y));
    }

    public logicalToAbsolute(logical: PositionTuple): PositionTuple {
        return this.offsetManager.logicalToAbsolute(logical);
    }

    public calculateOffset(logical: PositionTuple): number {
        return this.offsetManager.calculateOffset(logical);
    }

    /**
     * Convert page XY to logical coords. The XY coords must be relative to the layers div on the page.
     * @returns The logical position */
    public visualToNearestLogical(x: number, y: number): PositionTuple {
        const charSize = this.view.getCharSize();
        const lineHeight = this.properties.view!.lineHeight!;

        const logicalX = Math.round(x / charSize);
        const logicalY = Math.floor(y / lineHeight);

        return new PositionTuple(logicalX, logicalY);
    }

    public logicalToVisual(logical: PositionTuple): PositionTuple {
        const charSize = this.view.getCharSize();
        const lineHeight = this.properties.view!.lineHeight!;

        const visualX = logical.x * charSize;
        const visualY = logical.y * lineHeight;

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


    /**
     +---------------------------+
     |           Logic           |
     +---------------------------+    */

    type(char: string) {
        console.log(char)

        this.caretModel.forEachCaret(caret => {
            this.insertText(0, char);

            caret.shift(1);
        });

        this.view.render();
    }

    insertText(offset: Offset, text: string) {
        this.data.raw.insert(offset, text);

        this.offsetManager.offset(offset, text.length);
        this.offsetManager.recomputeNewLines(offset, text);

        let lexer = this.plugins.getLexerForFileType(this.data.language);
        if (!lexer) {
            lexer = this.defaultLexer;
        }

        let highlighter = this.plugins.getHighlighterForFileType(this.data.language);
        if (!highlighter) {
            highlighter = this.defaultHighlighter;
        }

        let ctx = this.offsetManager.withContext(offset);

        let tokens = lexer.asTokenStream(ctx.text);

        this.data.setComponentsAtRange(ctx.begin, ctx.end, [...highlighter.highlight(tokens)]);
    }

    /**
     +---------------------------+
     |      Event Listeners      |
     +---------------------------+    */
    onKeyDown(editor: Editor, event: KeyboardEvent) {
        this.fireKeybinding(event);
    }

    onMouseDown(editor: Editor, event: MouseEvent) {

    }

    onMouseUp(editor: Editor, event: MouseEvent) {

    }

    onMouseMove(editor: Editor, event: MouseEvent) {

    }

    onInput(editor: Editor, event: InputEvent) {
        if (event.data) this.type(event.data);
    }
}