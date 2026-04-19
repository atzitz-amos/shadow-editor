import {SynFile} from "../api/SynFile";
import {SynElement} from "../api/SynElement";
import {TextRange} from "../../../../editor/core/coordinate/TextRange";
import {SynNode} from "../api/SynNode";
import {EditorURI} from "../../../uri/EditorURI";
import {WorkspaceFile} from "../../../workspace/filesystem/tree/WorkspaceFile";
import {RelativePath} from "../../../workspace/filesystem/path/RelativePath";
import {Document} from "../../../../editor/core/document/Document";

/**
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export class SynFileImpl implements SynFile {
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

    getTextRange(): TextRange {
        return this.document.getFullRange();
    }

    getPath(): RelativePath | null {
        return this.document.isAssociatedWithFile() ? this.document.getAssociatedFile()!.getPath() : null;
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
}
