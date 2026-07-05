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

    public static async getDocumentForFile(file: WorkspaceFile): Promise<Document> {
        return await this.getInstance().getDocumentForFile(file);
    }

    public async getDocumentForFile(file: WorkspaceFile): Promise<Document> {
        if (this.documents.has(file)) return this.documents.get(file)!;
        return await this.createDocumentForFile(file);
    }

    public async createDocumentForFile(file: WorkspaceFile): Promise<Document> {
        let fileTypeHandler = LangSupport.getInstance().getFileTypeHandler(file);
        const document = new Document(0, await file.getTextContent(), fileTypeHandler ? fileTypeHandler.getLanguageForFile(file) : null);
        document.linkFile(file);
        this.documents.set(file, document);
        return document;
    }
}
