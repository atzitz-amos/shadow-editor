import {SynFile} from "../api/SynFile";
import {SynElement} from "../api/SynElement";
import {ProjectFile} from "../../../../project/filetree/ProjectFile";
import {TextRange} from "../../../../../editor/core/coordinate/TextRange";
import {SynNode} from "../api/SynNode";
import {Path} from "../../../../project/path/Path";
import {EditorURI} from "../../../../project/uri/EditorURI";

/**
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export class SynFileImpl implements SynFile {
    private readonly children: SynNode[] = [];

    constructor(private file: ProjectFile) {
    }

    getURI(): EditorURI {
        return this.file.getURI();
    }

    getSynFile(): SynFile {
        return this;
    }

    getProjectFile(): ProjectFile {
        return this.file;
    }

    getChildren(): SynNode[] {
        return this.children;
    }

    getTextRange(): TextRange {
        return new TextRange(0, this.file.getContent().length);
    }

    getPath(): Path {
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
