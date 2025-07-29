import {RawEditorData} from "./raw";
import {InlineComponent} from "../../ui/components/Inline";
import {EDAC, EditorComponentsData} from "./edac";
import {TextContext, TextRange} from "../Position";
import {SRTree} from "../lang/parser/SRTree";

export class EditorData {
    edac: EditorComponentsData = new EditorComponentsData();
    raw: RawEditorData;
    language: string = "plaintext";
    srTree: SRTree;

    constructor(initialString: string) {
        this.raw = new RawEditorData(initialString);
    }

    get text(): string {
        return this.raw.toString();
    }

    setLanguage(language: string) {
        this.language = language;
    }

    /**
     * Return the context to be reparsed to account for modifications at the `at` position */
    withContext(at: Offset): TextContext {
        let scope = this.srTree.scoping.toplevel(); // TODO: this.srTree.scoping.getScopeAt(at);
        return {
            begin: scope.range.begin,
            end: scope.range.end,
            text: this.raw.getTextInRange(scope.range),
            scope: scope,
            containingNode: this.srTree.getContainingNodeAt(at)
        }
    }


    setComponentsAtRange(range: TextRange, components: Iterable<InlineComponent>) {
        this.edac.set(range, components);
    }

    take(n: number, from: Offset, lineBreaks: Offset[]): EDAC[] {
        let result: EDAC[] = [];

        for (let i = 0; i < n; i++) {
            result.push(this.getLine(from + i, lineBreaks));
        }
        return result;
    }

    getLine(line: number, lineBreaks: Offset[]): EDAC {
        if (lineBreaks.length <= line) {
            return {
                gutter: [],
                content: [],
                line: line
            };
        } else {
            let range = new TextRange(lineBreaks[line], lineBreaks[line + 1] || this.raw.length());
            return {
                content: this.edac.toRenderables(this.edac.query(range), lineBreaks[line]),
                gutter: this.edac.gutterToRenderables(line),
                line: line
            };
        }
    }
}