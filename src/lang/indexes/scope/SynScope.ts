import {ResolveScope} from "../resolve/ResolveScope";
import {ResolvedReference} from "../resolve/result/ResolvedReference";
import {IndexFile} from "../IndexFile";
import {SynNamedElement} from "../../syntax/impl/reference/SynNamedElement";
import {SynCodeBlock} from "../../syntax/api/SynCodeBlock";
import {SynScopeType} from "./SynScopeType";
import {SimpleResolvedReference} from "../resolve/result/SimpleResolvedReference";

/**
 *
 * @author Atzitz Amos
 * @date 8/28/2026
 * @since 1.0.0
 */
export abstract class SynScope implements IndexFile {
    protected readonly parents: IndexFile[] = [];
    protected readonly declarations: Map<string, SynNamedElement> = new Map();

    constructor(protected associatedCodeblock: SynCodeBlock) {
    }

    getParent(): SynScope {
        return <SynScope>this.parents[0];
    }

    getAssociatedCodeBlock(): SynCodeBlock | null {
        return this.associatedCodeblock;
    }

    getParents(): IndexFile[] {
        return this.parents;
    }

    makeAvailable(file: IndexFile): void {
        if (!this.parents.includes(file))
            this.parents.push(file);
    }

    acceptChildrenResolveRequest(scope: ResolveScope): boolean {
        return scope >= ResolveScope.FILE;
    }

    clear(): void {
        this.declarations.clear();
    }

    declare(element: SynNamedElement): void {
        this.declarations.set(element.getName(), element);
    }

    remove(name: string): void {
        this.declarations.delete(name);
    }

    resolve(name: string, scope: ResolveScope): ResolvedReference[] {
        let results: ResolvedReference[] = [];
        let declaration = this.declarations.get(name);
        if (declaration) {
            results.push(new SimpleResolvedReference(declaration));
        }

        for (const parent of this.parents) {
            if (parent.acceptChildrenResolveRequest(scope))
                results = results.concat(parent.resolve(name, scope));
        }

        return results;
    }

    abstract getScopeType(): SynScopeType;
}
