import {IndexFile} from "../IndexFile";
import {ResolveScope} from "../resolve/ResolveScope";
import {ResolvedReference} from "../resolve/result/ResolvedReference";
import {SynGlobalScope} from "../scope/SynGlobalScope";
import {SynTree} from "../../syntax/api/tree/SynTree";

/**
 *
 * @author Atzitz Amos
 * @date 8/31/2026
 * @since 1.0.0
 */
export class DocumentLevelIndexFile implements IndexFile {
    private readonly parents: IndexFile[] = [];

    private globalScope: SynGlobalScope;

    constructor(globalScope: SynGlobalScope) {
        this.globalScope = globalScope;
        this.globalScope.makeAvailable(this);
    }

    getUnderlyingGlobalScope(): SynGlobalScope {
        return this.globalScope;
    }

    getParents(): IndexFile[] {
        return this.parents;
    }

    makeAvailable(file: IndexFile): void {
        if (!this.parents.includes(file)) {
            this.parents.push(file);
        }
    }

    resolve(name: string, scope: ResolveScope): ResolvedReference[] {
        let results: ResolvedReference[] = [];
        for (const parent of this.parents) {
            if (parent.acceptChildrenResolveRequest(scope))
                results = results.concat(parent.resolve(name, scope));
        }

        return results;
    }

    acceptChildrenResolveRequest(scope: ResolveScope): boolean {
        return scope >= ResolveScope.IMPORTS;
    }

    override(tree: SynTree) {
        this.globalScope = tree.getGlobalScope();
        this.globalScope.makeAvailable(this);
    }
}
