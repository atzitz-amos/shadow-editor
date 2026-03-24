/**
 *
 * @author Atzitz Amos
 * @date 3/18/2026
 * @since 1.0.0
 */
export class NodeMetadata {

    constructor(
        private baseHash: string,
        private lastVirtualSyncAt: number,
        private lastLocalSyncAt: number,
        private lastKnownSize: number) {
    }

    static fromJSON(value: any): NodeMetadata {
        if (typeof value.baseHash !== 'string'
            || typeof value.lastVirtualSyncAt !== 'number'
            || typeof value.lastLocalSyncAt !== 'number'
            || typeof value.lastKnownSize !== 'number') {
            throw new Error('Invalid NodeMetadata JSON');
        }
        return new NodeMetadata(
            value.baseHash,
            value.lastVirtualSyncAt,
            value.lastLocalSyncAt,
            value.lastKnownSize
        );
    }
}
