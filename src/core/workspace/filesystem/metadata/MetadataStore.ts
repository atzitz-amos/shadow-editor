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

    public renamePath(oldPath: RelativePath, newPath: RelativePath): void {
        const oldKey = oldPath.toString();
        const newKey = newPath.toString();

        if (oldKey === newKey) {
            return;
        }

        const next = new Map<string, NodeMetadata>();
        const subtreePrefix = oldKey.length === 0 ? "" : `${oldKey}/`;
        for (const [key, value] of this.cache.entries()) {
            if (key === oldKey) {
                next.set(newKey, value);
            } else if (subtreePrefix.length > 0 && key.startsWith(subtreePrefix)) {
                next.set(newKey + key.slice(oldKey.length), value);
            } else {
                next.set(key, value);
            }
        }

        this.cache.clear();
        for (const [key, value] of next.entries()) {
            this.cache.set(key, value);
        }
    }
}
