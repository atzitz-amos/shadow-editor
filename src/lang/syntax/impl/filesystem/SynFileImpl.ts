import {EditorURI} from "../../../../core/uri/EditorURI";
import {ProjectFile} from "../../../../core/project/filesystem/tree/ProjectFile";
import {RelativePath} from "../../../../core/project/filesystem/path/RelativePath";
import {SynNodeVisitor} from "../../visitors/SynNodeVisitor";
import {SynDocument} from "../../api/document/SynDocument";
import {SynFile} from "../../api/filesystem/SynFile";
import {SynDocumentManager} from "../../manager/SynDocumentManager";
import {EditorDocumentManager} from "../../../../editor/core/document/EditorDocumentManager";

/**
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export class SynFileImpl implements SynFile {
    private synDocument: SynDocument | null;

    constructor(private readonly file: ProjectFile) {

    }

    getURI(): EditorURI {
        return this.file.getURI();
    }

    getSynDocument(): SynDocument {
        if (!this.synDocument)
            this.synDocument = SynDocumentManager.createSynDocument(EditorDocumentManager.getDocumentForFile(this.file), this);
        return this.synDocument;
    }

    getProjectFile(): ProjectFile | null {
        return this.file;
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
