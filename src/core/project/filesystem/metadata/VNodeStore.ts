import {createVDir, createVFile, VFileNode, VNode} from "./VNode";
import {Persisted} from "../../../persistence/objects/Persisted";

/**
 *
 * @author Atzitz Amos
 * @date 3/17/2026
 * @since 1.0.0
 */
export class VNodeStore {
    @Persisted({
        mutable: true
    })
    private static accessor nodesById = new Map<string, VNode>();

    private static instance: VNodeStore | null = null;
    private readonly nodesById: Map<string, VNode>;
    private readonly childrenByParent: Map<string, Map<string, string>>;

    private constructor() {
        this.nodesById = VNodeStore.nodesById;
        this.childrenByParent = VNodeStore.buildChildrenIndex(this.nodesById);
    }

    public static getInstance(): VNodeStore {
        if (!VNodeStore.instance) {
            // VERY IMPORTANT! The instance must be created on-demand, that is AFTER the Lifecycle completes and the nodesById is loaded from memory
            VNodeStore.instance = new VNodeStore();
        }
        return VNodeStore.instance;
    }

    private static buildChildrenIndex(nodesById: Map<string, VNode>): Map<string, Map<string, string>> {
        const index = new Map<string, Map<string, string>>();
        for (const node of nodesById.values()) {
            const parentKey = node.parentId ?? "";
            if (!index.has(parentKey)) {
                index.set(parentKey, new Map());
            }
            index.get(parentKey)!.set(node.name, node.id);
        }
        return index;
    }

    /** NOTE: also returns soft-deleted nodes. Check `deletedAt` if you need live nodes only. */
    public getById(id: string): VNode | undefined {
        return this.nodesById.get(id);
    }

    public resolvePath(path: string, parentId: string = ""): VNode | undefined {
        const segments = path.split('/').filter(Boolean);
        let current: VNode | undefined;

        for (const segment of segments) {
            if (segment === ".") continue;
            const childId = this.childrenByParent.get(parentId)?.get(segment);
            if (!childId) return undefined;
            current = this.nodesById.get(childId);
            if (!current || current.deletedAt !== null) return undefined;
            parentId = current.id;
        }
        return current;
    }

    public getChildren(dirId: string): VNode[] {
        const children = this.childrenByParent.get(dirId);
        if (!children) return [];

        const result: VNode[] = [];
        for (const id of children.values()) {
            const node = this.nodesById.get(id);
            if (node && node.deletedAt === null) result.push(node);
        }
        return result;
    }

    public getPath(id: string): string {
        const parts: string[] = [];
        let node = this.nodesById.get(id);
        while (node) {
            parts.push(node.name);
            node = node.parentId ? this.nodesById.get(node.parentId) : undefined;
        }
        return '/' + parts.reverse().join('/');
    }

    public getRoot(name: string): VNode {
        const id = "root_" + name;
        if (!this.nodesById.get(id)) {
            this.createDir(id, name, null, Date.now(), Date.now(), null);
        }
        return this.nodesById.get(id)!;
    }

    public createFile(id: string,
                      name: string,
                      parentId: string | null,
                      createdAt: number,
                      modifiedAt: number,
                      deletedAt: number | null,
                      size: number,
                      mimeType: string): VFileNode {
        return this.register(createVFile(
            id,
            name,
            parentId,
            createdAt,
            modifiedAt,
            deletedAt,
            size,
            mimeType)
        ) as VFileNode;
    }

    public createDir(id: string,
                     name: string,
                     parentId: string | null,
                     createdAt: number,
                     modifiedAt: number,
                     deletedAt: number | null): VNode {
        return this.register(createVDir(
            id,
            name,
            parentId,
            createdAt,
            modifiedAt,
            deletedAt
        ));
    }

    public rename(id: string, newName: string): void {
        const node = this.requireNode(id);
        this.assertNameFree(node.parentId, newName, id);

        const siblings = this.siblings(node.parentId);
        siblings.delete(node.name);
        node.name = newName;
        node.modifiedAt = Date.now();
        siblings.set(newName, id);
    }

    public move(id: string, newParentId: string | null): void {
        const node = this.requireNode(id);
        this.assertNameFree(newParentId, node.name, id);
        this.assertNotInsideSelf(id, newParentId);

        this.siblings(node.parentId).delete(node.name);
        node.parentId = newParentId;
        node.modifiedAt = Date.now();
        this.siblings(newParentId).set(node.name, id);
    }

    public delete(id: string): void {
        const node = this.nodesById.get(id);
        if (!node) return;
        node.deletedAt = Date.now(); // soft delete; keep in maps for undo/history
    }

    /** Size + modifiedAt in one go (one mutation instead of two for the persistence layer to observe). */
    public updateFile(id: string, size: number, modifiedAt: number): void {
        const node = this.requireNode(id) as VFileNode;
        node.size = size;
        node.modifiedAt = modifiedAt;
    }

    updateModifiedAt(id: string, at: number) {
        this.requireNode(id).modifiedAt = at;
    }

    updateFileSize(id: string, length: number) {
        (this.requireNode(id) as VFileNode).size = length;
    }

    private register(node: VNode) {
        this.assertNameFree(node.parentId, node.name);

        this.nodesById.set(node.id, node);
        this.siblings(node.parentId).set(node.name, node.id);

        return node;
    }

    private requireNode(id: string): VNode {
        const node = this.nodesById.get(id);
        if (!node) throw new Error(`Unknown node ${id}`);
        return node;
    }

    private siblings(parentId: string | null): Map<string, string> {
        const key = parentId ?? "";
        let map = this.childrenByParent.get(key);
        if (!map) {
            map = new Map();
            this.childrenByParent.set(key, map);
        }
        return map;
    }

    /**
     * The index is keyed by name, so a duplicate silently overwrites the old sibling: it would vanish from
     * getChildren/resolvePath while staying in nodesById. A slot held by a soft-deleted node may be reused.
     * (If you add "undo delete", restoring must re-check the name.)
     */
    private assertNameFree(parentId: string | null, name: string, selfId?: string): void {
        const existingId = this.childrenByParent.get(parentId ?? "")?.get(name);
        if (!existingId || existingId === selfId) return;

        const existing = this.nodesById.get(existingId);
        if (existing && existing.deletedAt === null) {
            throw new Error(`"${name}" already exists in this directory`);
        }
    }

    private assertNotInsideSelf(id: string, newParentId: string | null): void {
        let cursor = newParentId ? this.nodesById.get(newParentId) : undefined;
        while (cursor) {
            if (cursor.id === id) throw new Error("Cannot move a directory into itself");
            cursor = cursor.parentId ? this.nodesById.get(cursor.parentId) : undefined;
        }
    }
}