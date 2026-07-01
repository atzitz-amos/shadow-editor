import {TextRange} from "../../../../../editor/core/coordinate/range/TextRange";
import {EditorURI} from "../../../../uri/EditorURI";
import {WorkspaceFile} from "../../../../workspace/filesystem/tree/WorkspaceFile";
import {RelativePath} from "../../../../workspace/filesystem/path/RelativePath";
import {SynNodeVisitor} from "../../utils/visitors/SynNodeVisitor";
import {SynDocument} from "../../api/document/SynDocument";
import {SynFile} from "../../api/filesystem/SynFile";

/**
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export class SynFileImpl implements SynFile {
    constructor(private readonly file: WorkspaceFile, private document: SynDocument) {
    }

    getURI(): EditorURI {
        return this.file.getURI();
    }

    getSynDocument(): SynDocument {
        return this.document;
    }

    getWorkspaceFile(): WorkspaceFile | null {
        return this.file;
    }

    getTextRange(): TextRange {
        return this.document.getFullRange();
    }

    getPath(): RelativePath | null {
        return this.file.getPath();
    }

    toDebugString(): string {
        return `SynFileImpl(${this.file.getURI().toString()})`;
    }

    accept(visitor: SynNodeVisitor): void {
        visitor.visitFile(this);
    }
}
