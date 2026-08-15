import {LangSupport} from "../../../lang/LangSupport";
import {ProjectFile} from "../../../core/project/filesystem/tree/ProjectFile";
import {Document} from "./Document";
import {UUIDHelper} from "../../utils/UUIDHelper";

/**
 *
 * @author Atzitz Amos
 * @date 7/2/2026
 * @since 1.0.0
 */
export class EditorDocumentManager {
    private static readonly instance: EditorDocumentManager = new EditorDocumentManager();

    private readonly documents: Map<string, Document> = new Map();

    public static getInstance() {
        return this.instance;
    }

    public static getDocumentForFile(file: ProjectFile): Document {
        return this.getInstance().getDocumentForFile(file);
    }

    public static getDocumentById(id: string) {
        return this.getInstance().getDocumentForId(id);
    }

    static getDocumentId(document: Document) {
        for (const [id, doc] of this.getInstance().documents.entries()) {
            if (doc === document) {
                return id;
            }
        }
        const uuid = UUIDHelper.newUUID();
        this.getInstance().documents.set(uuid, document);
        return uuid;
    }

    public getDocumentForId(id: string): Document | null {
        if (this.documents.has(id)) return this.documents.get(id)!;
        return null;
    }

    public getDocumentForFile(file: ProjectFile): Document {
        if (this.documents.has(file.getId())) return this.documents.get(file.getId())!;
        return this.createDocumentForFile(file);
    }

    public createDocumentForFile(file: ProjectFile): Document {
        let fileTypeHandler = LangSupport.getInstance().getFileTypeHandler(file);
        const document = new Document(
            file.getCachedContent() ?? "",
            fileTypeHandler ? fileTypeHandler.getLanguageForFile(file) : null);
        document.linkFile(file);
        this.documents.set(file.getId(), document);
        return document;
    }
}
