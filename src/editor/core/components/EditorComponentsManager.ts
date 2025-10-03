import {TextRange} from "../coordinate/TextRange";
import {GutterComponent} from "../../ui/gutter/components/component";
import {GutterLine} from "../../ui/gutter/components/line";
import {Editor} from "../../Editor";
import {Document} from "../document/Document";
import {EditorComponentsRenderer} from "./EditorComponentsRenderer";
import {InlineComponent} from "./InlineComponent";
import {InlineError} from "../../ui/components/inline/InlineError";


/**
 * Store the ranges of the components*/
export class EditorComponentsManager {
    editor: Editor;
    document: Document;

    renderer: EditorComponentsRenderer;

    components: InlineComponent[] = [];
    gutterComponents: GutterComponent[] = [];

    constructor(editor: Editor) {
        this.editor = editor;
        this.document = editor.getOpenedDocument();

        this.renderer = new EditorComponentsRenderer(this);
    }


    getComponentsRanges(): TextRange[] {
        return this.components.map(x => x.range);
    }

    getAllComponents(): InlineComponent[] {
        return this.components;
    }

    getComponentsForRange(range: TextRange): InlineComponent[] {
        return this.components.filter(component => range.contains(component.range));
    }

    getAssociatedGutterComponents(line: number) {
        return [new GutterLine(line) as GutterComponent].concat(this.gutterComponents.filter(c => c.line === line));
    }

    add(component: InlineComponent) {
        this.components.push(component);
    }

    addError(error: InlineError) {
        this.components.push(error);
    }

    addGutterComponent(component: GutterComponent) {
        this.gutterComponents.push(component);
    }

    setRange(range: TextRange, components: Iterable<InlineComponent>) {
        this.clearRange(range);

        for (const component of components) {
            this.add(component);
        }
    }

    clearRange(range: TextRange) {
        let newComponents: InlineComponent[] = [], newGutterComponents: GutterComponent[] = [];

        for (let component of this.components) {
            if (component.range.overlaps(range)) {
                component.onDestroy(this.editor);
            } else {
                newComponents.push(component)
            }
        }

        for (let component of this.gutterComponents) {
            let begin = this.editor.offsetToLogical(range.start);
            let end = this.editor.offsetToLogical(range.end);
            if (component.line >= begin.row && component.line <= end.row) {
                component.onDestroy(this.editor);
            } else {
                newGutterComponents.push(component)
            }
        }

        this.components = newComponents;
        this.gutterComponents = newGutterComponents;
    }

    getDocument() {
        return this.document;
    }

    getRenderer(): EditorComponentsRenderer {
        return this.renderer;
    }
}
