import {EditorURI} from "../../../../uri/EditorURI";
import {WorkspaceFile} from "../../../../workspace/filesystem/tree/WorkspaceFile";
import {RelativePath} from "../../../../workspace/filesystem/path/RelativePath";
import {SynNodeVisitor} from "../../utils/visitors/SynNodeVisitor";
import {SynDocument} from "../../api/document/SynDocument";
import {SynFile} from "../../api/filesystem/SynFile";
import {SynDocumentManager} from "../../manager/SynDocumentManager";
import {EditorDocumentManager} from "../../../../../editor/core/document/EditorDocumentManager";

/**
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export class SynFileImpl implements SynFile {
    private synDocument: SynDocument | null;

    constructor(private readonly file: WorkspaceFile) {

    }

    getURI(): EditorURI {
        return this.file.getURI();
    }

    async getSynDocument(): Promise<SynDocument> {
        if (!this.synDocument)
            this.synDocument = SynDocumentManager.createSynDocument(await EditorDocumentManager.getDocumentForFile(this.file), this);
        return this.synDocument;
    }

    getCachedSynDocument(): SynDocument | null {
        return this.synDocument;
    }

    getWorkspaceFile(): WorkspaceFile | null {
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
