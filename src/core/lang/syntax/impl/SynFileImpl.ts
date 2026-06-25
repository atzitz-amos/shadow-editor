import {SynFile} from "../api/SynFile";
import {SynElement} from "../api/SynElement";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {SynNode} from "../api/SynNode";
import {EditorURI} from "../../../uri/EditorURI";
import {WorkspaceFile} from "../../../workspace/filesystem/tree/WorkspaceFile";
import {RelativePath} from "../../../workspace/filesystem/path/RelativePath";
import {Document} from "../../../../editor/core/document/Document";
import {SynNodeVisitor} from "../visitors/SynNodeVisitor";
import {SynModifiableFile} from "../api/SynModifiableFile";

/**
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export class SynFileImpl implements SynModifiableFile {
    private readonly children: SynNode[] = [];

    constructor(private document: Document) {
    }

    getURI(): EditorURI {
        return this.document.isAssociatedWithFile() ? EditorURI.invalid() : this.document.getAssociatedFile()!.getURI();
    }

    getSynFile(): SynFile {
        return this;
    }

    getWorkspaceFile(): WorkspaceFile | null {
        return this.document.getAssociatedFile();
    }

    getChildren(): SynNode[] {
        return this.children;
    }

    nextSibling(): null {
        return null;
    }

    previousSibling(): null {
        return null;
    }

    getTextRange(): TextRange {
        return this.document.getFullRange();
    }

    getPath(): RelativePath | null {
        return this.document.isAssociatedWithFile() ? this.document.getAssociatedFile()!.getPath() : null;
    }

    toDebugString(): string {
        return `(FILE ${this.children.map(child => child.toDebugString()).join(" ")})`;
    }

    toTreeRepr(): string {
        return this.constructor.name + " {\n" + this.children.map(child => child.toTreeRepr()).join(",\n").split("\n").map(line => "  " + line).join("\n") + "\n}";
    }

    getParent(): SynElement | null {
        return null;
    }

    _setParent(parent: SynElement): void {
    }

    isSynElement<T extends SynNode>(this: T): this is SynElement {
        return false;
    }

    addChild(node: SynNode): void {
        this.children.push(node);
    }

    isSynthetic(): boolean {
        return false;
    }

    accept(visitor: SynNodeVisitor): void {
        visitor.visitFile(this);
    }
}
