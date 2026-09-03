import {IndexFile} from "../IndexFile";
import {ResolveScope} from "../resolve/ResolveScope";
import {ResolvedReference} from "../resolve/result/ResolvedReference";
import {SynFile} from "../../syntax/api/filesystem/SynFile";
import {Serializable, SerializableType} from "../../../core/persistence/serializable/Serializable";

/**
 *
 * @author Atzitz Amos
 * @date 9/1/2026
 * @since 1.0.0
 */
export class FileLevelIndexFile implements IndexFile, Serializable {
    private readonly synFile: SynFile;
    private lastModifiedTimestamp: number = 0;

    private readonly declarations: Map<string, ResolvedReference>;

    constructor(synFile: SynFile) {
        this.synFile = synFile;
    }

    public static deserializer(data: any): FileLevelIndexFile {

    }

    serialize(): SerializableType {
        throw new Error("Method not implemented.");
    }

    getParents(): IndexFile[] {
        return [];
    }

    makeAvailable(file: IndexFile): void {

    }

    resolve(name: string, scope: ResolveScope): ResolvedReference[] {
        throw new Error("Method not implemented.");
    }

    acceptChildrenResolveRequest(scope: ResolveScope): boolean {
        return scope >= ResolveScope.IMPORTS;
    }
}

