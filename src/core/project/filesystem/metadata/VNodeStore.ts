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
    private static accessor nodesById = new Map<string, VNode>;

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
        return [...children.values()]
            .map(id => this.nodesById.get(id)!)
            .filter(n => n.deletedAt === null);
    }

    public getPath(id: string): string {
        const parts: string[] = [];
        let node = this.nodesById.get(id);
        while (node) {
            parts.unshift(node.name);
            node = node.parentId ? this.nodesById.get(node.parentId) : undefined;
        }
        return '/' + parts.join('/');
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
        const node = this.nodesById.get(id);
        if (!node) throw new Error(`Unknown node ${id}`);
        const parentKey = node.parentId ?? "";
        this.childrenByParent.get(parentKey)?.delete(node.name);
        node.name = newName;
        node.modifiedAt = Date.now();
        this.childrenByParent.get(parentKey)!.set(newName, id);
    }

    public move(id: string, newParentId: string | null): void {
        const node = this.nodesById.get(id);
        if (!node) throw new Error(`Unknown node ${id}`);
        const oldKey = node.parentId ?? "";
        const newKey = newParentId ?? "";
        this.childrenByParent.get(oldKey)?.delete(node.name);
        node.parentId = newParentId;
        node.modifiedAt = Date.now();
        if (!this.childrenByParent.has(newKey)) this.childrenByParent.set(newKey, new Map());
        this.childrenByParent.get(newKey)!.set(node.name, id);
    }

    public delete(id: string): void {
        const node = this.nodesById.get(id);
        if (!node) return;
        node.deletedAt = Date.now(); // soft delete; keep in maps for undo/history
    }

    updateModifiedAt(id: string, at: number) {
        this.getById(id)!.modifiedAt = at;
    }

    updateFileSize(id: string, length: number) {
        (<VFileNode>this.getById(id)).size = length;
    }

    private register(node: VNode) {
        this.nodesById.set(node.id, node);
        const parentKey = node.parentId ?? "";
        if (!this.childrenByParent.has(parentKey)) {
            this.childrenByParent.set(parentKey, new Map());
        }
        this.childrenByParent.get(parentKey)!.set(node.name, node.id);

        return node;
    }
}