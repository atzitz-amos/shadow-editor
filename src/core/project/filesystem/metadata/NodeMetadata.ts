/**
 *
 * @author Atzitz Amos
 * @date 8/13/2026
 * @since 1.0.0
 */
export interface NodeMetadata {
    name: string;
    createdAt: number;
    deletedAt: number | null;
}

export interface FileMetadata extends NodeMetadata {
    modifiedAt: number;
    size: number;
    mimeType: string;
}


export interface DirectoryMetadata extends NodeMetadata {
}