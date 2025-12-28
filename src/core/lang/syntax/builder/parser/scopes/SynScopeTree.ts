import {SynScopeImpl} from "./SynScope";
import {SynScopeType} from "./SynScopeType";
import {SynCodeBlock} from "../../../api/SynCodeBlock";

/**
 * Tree to build scopes hierarchy
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export class SynScopeTree {
    private currentScope: SynScopeImpl | null = null;

    public getCurrentScope(): SynScopeImpl | null {
        return this.currentScope;
    }

    public enterScope(scopeType: SynScopeType): void {
        this.currentScope = new SynScopeImpl(scopeType, this.currentScope);
    }

    public exitScope(codeblock: SynCodeBlock): void {
        if (this.currentScope) {
            this.currentScope.setAssociatedCodeBlock(codeblock);
        }
        this.currentScope = <SynScopeImpl>this.currentScope?.getParent();
    }
}
