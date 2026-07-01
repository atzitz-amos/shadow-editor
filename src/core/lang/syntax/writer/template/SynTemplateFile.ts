import {TextRange} from "../../../../../editor/core/coordinate/range/TextRange";
import {EditorURI} from "../../../../uri/EditorURI";
import {RelativePath} from "../../../../workspace/filesystem/path/RelativePath";
import {WorkspaceFile} from "../../../../workspace/filesystem/tree/WorkspaceFile";
import {SynASTElement} from "../../api/tree/SynASTElement";
import {SynFile} from "../../api/filesystem/SynFile";
import {SynModifiableFile} from "../../api/filesystem/SynModifiableFile";
import {SynNode} from "../../api/SynNode";
import {SynNodeVisitor} from "../../utils/visitors/SynNodeVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 6/6/2026
 * @since 1.0.0
 */
export class SynTemplateFile implements SynModifiableFile {
    private readonly children: SynNode[] = [];
    addChild(node: SynNode): void {
        this.children.push(node);
    }

    getWorkspaceFile(): WorkspaceFile | null {
        return null;
    }

    getPath(): RelativePath | null {
        return null;
    }

    getSynDocument(): SynFile {
        return this;
    }

    getChildren(): SynNode[] {
        return this.children;
    }

    getTextRange(): TextRange {
        let start: Offset = 0, end: Offset = 0;
        for (const child of this.children) {
            const childRange = child.getTextRange();
            if (childRange.getStart() < start) {
                start = childRange.getStart();
            }
            if (childRange.getEnd() > end) {
                end = childRange.getEnd();
            }
        }
        return new TextRange(start, end);
    }

    getURI(): EditorURI {
        return EditorURI.invalid();
    }

    getParent(): SynASTElement | null {
        return null;
    }

    nextSibling(): SynNode | null {
        return null;
    }

    previousSibling(): SynNode | null {
        return null;
    }

    _setParent(parent: SynASTElement): void {
        throw new Error("Method not implemented.");
    }

    isSynElement<T extends SynNode>(this: T): this is SynASTElement {
        return false;
    }

    toDebugString(): string {
        return `(FILE ${this.children.map(child => child.toDebugString()).join(" ")})`;
    }

    toTreeRepr(): string {
        return this.constructor.name + " {\n" + this.children.map(child => child.toTreeRepr()).join(",\n").split("\n").map(line => "  " + line).join("\n") + "\n}";
    }

    isSynthetic(): boolean {
        return false;
    }

    accept(visitor: SynNodeVisitor): void {
        visitor.visitFile(this);
    }

}
