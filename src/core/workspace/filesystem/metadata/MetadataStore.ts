import {WorkspaceFS} from "../WorkspaceFS";
import {WorkspaceFile} from "../tree/WorkspaceFile";
import {RelativePath} from "../path/RelativePath";
import {NodeMetadata} from "./NodeMetadata";

/**
 *
 * @author Atzitz Amos
 * @date 3/17/2026
 * @since 1.0.0
 */
export class MetadataStore {
    public static readonly METADATA_FILE_PATH = ".shadow.meta";

    private metaDir: WorkspaceFile;

    private readonly cache: Map<string, NodeMetadata> = new Map();

    constructor(private fs: WorkspaceFS) {
    }

    public async load() {
        if (await this.fs.exists(MetadataStore.METADATA_FILE_PATH)) {
            this.metaDir = await this.fs.getFile(MetadataStore.METADATA_FILE_PATH);
        } else {
            this.metaDir = await this.fs.getRoot().createFile(MetadataStore.METADATA_FILE_PATH);
        }

        const text = await this.metaDir.getTextContent();
        const json = text == "" ? {} : JSON.parse(text);
        for (const [key, value] of Object.entries(json)) {
            this.cache.set(key, NodeMetadata.fromJSON(value))
        }
    }

    getMetadata(path: RelativePath): NodeMetadata | null {
        const key = path.toString();
        if (this.cache.has(key)) {
            return this.cache.get(key)!;
        }
        return null;
    }
}
