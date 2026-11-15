import {SerializableType} from "../../../persistence/serializable/Serializable";

/**
 *
 * @author Atzitz Amos
 * @date 8/10/2026
 * @since 1.0.0
 */
interface VNodeBase {
    readonly id: string;

    kind: 'file' | 'binary' | 'directory';

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


/** A file whose content is raw bytes: never decoded as text, so never opened in an editor or searched. */
export interface VBinaryNode extends VNodeBase {
    kind: 'binary';
    size: number;
    mimeType: string;
}

/** Any node backed by a blob (text or binary). */
export type VContentNode = VFileNode | VBinaryNode;

export type VNode = VFileNode | VBinaryNode | VDirNode;

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

export function createVBinary(id: string,
                              name: string,
                              parentId: string | null,
                              createdAt: number,
                              modifiedAt: number,
                              deletedAt: number | null,
                              size: number,
                              mimeType: string): VBinaryNode {
    return {
        id,
        kind: 'binary' as const,
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