import {LangSupport} from "../../../core/lang/LangSupport";
import {WorkspaceFile} from "../../../core/workspace/filesystem/tree/WorkspaceFile";
import {Document} from "./Document";

/**
 *
 * @author Atzitz Amos
 * @date 7/2/2026
 * @since 1.0.0
 */
export class EditorDocumentManager {
    private static readonly instance: EditorDocumentManager = new EditorDocumentManager();

    private documents: WeakMap<WorkspaceFile, Document> = new WeakMap();

    public static getInstance() {
        return this.instance;
    }

    public static getDocumentForFile(file: WorkspaceFile): Document {
        return this.getInstance().getDocumentForFile(file);
    }

    public getDocumentForFile(file: WorkspaceFile): Document {
        if (this.documents.has(file)) return this.documents.get(file)!;
        return this.createDocumentForFile(file);
    }

    public createDocumentForFile(file: WorkspaceFile): Document {
        let fileTypeHandler = LangSupport.getInstance().getFileTypeHandler(file);
        const document = new Document(
            0,
            file.getCachedContent() ?? "",
            fileTypeHandler ? fileTypeHandler.getLanguageForFile(file) : null);
        document.linkFile(file);
        this.documents.set(file, document);
        return document;
    }
}
