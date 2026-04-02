import {SynFile} from "../api/SynFile";
import {SynElement} from "../api/SynElement";
import {TextRange} from "../../../../editor/core/coordinate/TextRange";
import {SynNode} from "../api/SynNode";
import {EditorURI} from "../../../uri/EditorURI";
import {WorkspaceFile} from "../../../workspace/filesystem/tree/WorkspaceFile";
import {RelativePath} from "../../../workspace/filesystem/path/RelativePath";

/**
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export class SynFileImpl implements SynFile {
    private readonly children: SynNode[] = [];

    constructor(private file: WorkspaceFile) {
    }

    getURI(): EditorURI {
        return this.file.getURI();
    }

    getSynFile(): SynFile {
        return this;
    }

    getWorkspaceFile(): WorkspaceFile {
        return this.file;
    }

    getChildren(): SynNode[] {
        return this.children;
    }

    getTextRange(): TextRange {
        return new TextRange(0, this.file.getLength());
    }

    getPath(): RelativePath {
        return this.file.getPath();
    }

    getParent(): SynElement | null {
        return null;
    }

    _setParent(parent: SynElement): void {
    }

    isSynElement<T extends SynNode>(this: T): boolean {
        return false;
    }

    addChild(node: SynNode): void {
        this.children.push(node);
    }
}
