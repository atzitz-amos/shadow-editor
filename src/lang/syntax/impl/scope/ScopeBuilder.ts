import {SynCodeBlock} from "../../api/SynCodeBlock";
import {SynScope} from "../../../indexes/scope/SynScope";
import {SynLocalScope} from "../../../indexes/scope/SynLocalScope";
import {SynGlobalScope} from "../../../indexes/scope/SynGlobalScope";
import {SynScopeType} from "../../../indexes/scope/SynScopeType";

/**
 * Tree to build scopes hierarchy
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export class ScopeBuilder {
    private currentScope: SynScope | null = null;

    constructor() {
    }

    public getCurrentScope(): SynScope | null {
        return this.currentScope;
    }

    public enterScope(type: SynScopeType, codeblock: SynCodeBlock): void {
        this.currentScope = new SynLocalScope(type, codeblock, this.currentScope!);
    }

    public enterGlobalScope(codeblock: SynCodeBlock): void {
        this.currentScope = new SynGlobalScope(codeblock);
    }

    public exitScope(): void {
        this.currentScope = <SynScope>this.currentScope!.getParents()[0];
    }
}
