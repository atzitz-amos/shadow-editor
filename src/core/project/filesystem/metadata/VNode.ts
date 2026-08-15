import {SerializableType} from "../../../persistence/serializable/Serializable";

/**
 *
 * @author Atzitz Amos
 * @date 8/10/2026
 * @since 1.0.0
 */
interface VNodeBase {
    readonly id: string;

    kind: 'file' | 'directory';

    name: string;
    parentId: string | null;

    createdAt: number;
    modifiedAt: number;
    deletedAt: number | null;
}

export interface VDirNode extends VNodeBase {
    kind: 'directory';
}

export interface VFileNode extends VNodeBase {
    kind: 'file';
    size: number;
    mimeType: string;
}


export type VNode = VFileNode | VDirNode;

export function createVFile(id: string,
                            name: string,
                            parentId: string | null,
                            createdAt: number,
                            modifiedAt: number,
                            deletedAt: number | null,
                            size: number,
                            mimeType: string): VFileNode {
    return {
        id,
        kind: 'file' as const,
        name,
        parentId,
        createdAt,
        modifiedAt,
        deletedAt,
        size,
        mimeType
    } satisfies SerializableType;
}

export function createVDir(id: string,
                           name: string,
                           parentId: string | null,
                           createdAt: number,
                           modifiedAt: number,
                           deletedAt: number | null): VDirNode {
    return {
        id,
        kind: 'directory' as const,
        name,
        parentId,
        createdAt,
        modifiedAt,
        deletedAt
    } satisfies SerializableType;
}