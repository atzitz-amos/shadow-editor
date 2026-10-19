import {SynParentElement} from "../../../../../lang/syntax/api/tree/SynParentElement";
import {JsIdentifier} from "../../syntax/literal/JsIdentifier";
import {ResolveScope} from "../../../../../lang/indexes/resolve/ResolveScope";
import {SynModTree} from "../../../../../lang/codeGen/modification/SynModTree";
import {AbstractSynTemplate} from "../../../../../lang/codeGen/template/AbstractSynTemplate";
import {SynNamedElement} from "../../../../../lang/syntax/impl/reference/SynNamedElement";
import {SimpleResolvedReference} from "../../../../../lang/indexes/resolve/result/SimpleResolvedReference";
import {JsSynRecursiveVisitor} from "../../syntax/visitors/JsSynRecursiveVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 9/28/2026
 * @since 1.0.0
 */
export class JsIdentifierUsageInScopeSearch {
    private readonly usages: JsIdentifier[];

    constructor(private readonly node: SynParentElement, identifier: SynNamedElement) {
        const usages: JsIdentifier[] = [];

        node.accept(new class extends JsSynRecursiveVisitor {
            visitIdentifier(node: JsIdentifier) {
                const result = node.getScope()?.resolve(node.getName(), ResolveScope.FILE);
                if (!(result?.[0] instanceof SimpleResolvedReference)) return;
                if (result[0].getNode() === identifier) {
                    usages.push(node);
                }
            }
        });

        this.usages = usages;
    }

    public forEachUsage(func: (id: JsIdentifier) => void) {
        for (const usage of this.usages) {
            func(usage);
        }
    }

    public getAllUsages(): JsIdentifier[] {
        return this.usages;
    }

    public replaceAllUsages(synModTree: SynModTree, func: (id: JsIdentifier) => AbstractSynTemplate) {
        for (const usage of this.usages) {
            synModTree.replaceNode(usage, func(usage));
        }
    }
}
