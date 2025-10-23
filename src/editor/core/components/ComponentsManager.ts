import {TextRange} from "../coordinate/TextRange";
import {GutterComponent} from "../../ui/gutter/components/component";
import {GutterLine} from "../../ui/gutter/components/line";
import {Editor} from "../../Editor";
import {Document} from "../document/Document";
import {ComponentsRenderer} from "./ComponentsRenderer";
import {InlineComponent} from "./InlineComponent";
import {InlineError} from "../../ui/components/inline/InlineError";
import {HighlightHolder} from "../../ui/highlighter/HighlightHolder";


/**
 * Store the ranges of the components*/
export class ComponentsManager {
    editor: Editor;
    document: Document;

    renderer: ComponentsRenderer;

    highlightsHolder: HighlightHolder;
    components: InlineComponent[] = [];
    gutterComponents: GutterComponent[] = [];

    constructor(editor: Editor) {
        this.editor = editor;
        this.document = editor.getOpenedDocument();

        this.renderer = new ComponentsRenderer(this);

        this.highlightsHolder = new HighlightHolder(editor);
    }


    getAllComponents(): InlineComponent[] {
        return this.components;
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
            if (component.range.intersects(range)) {
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

    getRenderer(): ComponentsRenderer {
        return this.renderer;
    }

    addAll(tokens: InlineComponent[]) {
        for (let token of tokens) {
            this.add(token);
        }
    }

    removeByName(name: string) {
        this.components = this.components.filter(c => c.name !== name);
    }

    getHighlightsHolder() {
        return this.highlightsHolder;
    }
}
