import {SynDocument} from "../../../syntax/api/document/SynDocument";
import {CodeAnalysisPass} from "../../analysis/api/CodeAnalysisPass";
import {Editor} from "../../../../editor/Editor";
import {SynNodeVisitor} from "../../../syntax/visitors/SynNodeVisitor";
import {SynCodeBlock} from "../../../syntax/api/SynCodeBlock";
import {ScopeBuilder} from "../../../syntax/impl/scope/ScopeBuilder";
import {SynNamedElement} from "../../../syntax/impl/reference/SynNamedElement";
import {SynNode} from "../../../syntax/api/SynNode";
import {SynTree} from "../../../syntax/api/tree/SynTree";

/**
 *
 * @author Atzitz Amos
 * @date 8/28/2026
 * @since 1.0.0
 */
export class ReferenceCollectorAnalysisPass implements CodeAnalysisPass<null> {
    constructor(private readonly document: SynDocument) {
    }

    collectVisitors(): SynNodeVisitor[] {
        const builder = new ScopeBuilder();
        let synTree: SynTree;

        return [
            new class extends SynNodeVisitor {
                visitTree(tree: SynTree) {
                    synTree = tree;
                }

                visitCodeblock(codeblock: SynCodeBlock) {
                    if (!builder.getCurrentScope()) {
                        builder.enterGlobalScope(synTree.getGlobalScope());
                    } else {
                        builder.enterScope(codeblock.getAssociatedScopeType()!, codeblock);
                    }
                    codeblock.setAssociatedScope(builder.getCurrentScope());
                }

                visitExitNode(node: SynNode) {
                    if (node instanceof SynCodeBlock && node.getAssociatedScope() !== null) builder.exitScope();
                }

                visitNamedElement(node: SynNamedElement) {
                    const currentScope = builder.getCurrentScope();
                    if (currentScope)
                        currentScope.declare(node);
                }
            }
        ]
    }

    processResults(editor: Editor): void {
    }

    getHolder(): null {
        return null;
    }

    runOnlyOnVisibleNodes(): boolean {
        return false;
    }

    getPriority(): number {
        return 0;
    }
}
