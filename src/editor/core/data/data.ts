import {RawEditorData} from "./raw";
import {InlineComponent} from "../../ui/components/inline/Inline";
import {EDAC, EditorComponentsData} from "./edac";
import {TextContext, TextRange} from "../Position";
import {SRTree} from "../lang/parser/SRTree";
import {OffsetManager} from "../OffsetManager";
import {InlineError} from "../../ui/components/inline/InlineError";
import {Editor} from "../../Editor";

export class EditorData {
    edac: EditorComponentsData;
    raw: RawEditorData;
    language: string = "plaintext";
    srTree: SRTree;

    constructor(editor: Editor, initialString: string) {
        this.raw = new RawEditorData(initialString);
        this.edac = new EditorComponentsData(editor);
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

    // Find the smallest word range containing the offset `at` delimited by `sep`
    getWordAt(at: number, sep: RegExp, offsetManager: OffsetManager): TextRange {
        let line = offsetManager.withLine(at);
        let lineBegin = offsetManager.lineBegin(at);

        at -= lineBegin; // Adjust `at` to be relative to the line

        function isMatch(ch: string): boolean {
            sep.lastIndex = 0;
            return sep.test(ch);
        }

        // Find left delimiter
        let start = -1;
        for (let i = at; i >= 0; i--) {
            if (isMatch(line[i])) {
                start = i;
                break;
            }
        }

        // Find right delimiter
        let end = -1;
        for (let i = at; i < line.length; i++) {
            if (isMatch(line[i])) {
                end = i;
                break;
            }
        }

        start = start === -1 ? 0 : start + 1; // If no left delimiter, start at 0
        if (end === -1) {
            end = line.length; // If no right delimiter, end at the end of the line
        }
        return new TextRange(start + lineBegin, end + lineBegin); // Return the range between the delimiters
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
            let length = this.raw.length() + 1; // We want to include potential error tokens at the end of the file


            let range = new TextRange(lineBreaks[line], lineBreaks[line + 1] || length);
            return {
                content: this.edac.toRenderables(this.edac.query(range), lineBreaks[line]),
                gutter: this.edac.gutterToRenderables(line),
                line: line
            };
        }
    }

    registerError(error: InlineError) {
        this.edac.registerError(error);
    }
}