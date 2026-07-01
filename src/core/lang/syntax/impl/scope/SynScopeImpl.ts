import {SynScopeType} from "../../api/scope/SynScopeType";
import {SynCodeBlock} from "../../api/SynCodeBlock";
import {SynDeclaration} from "../reference/SynDeclaration";
import {EditorURI} from "../../../../uri/EditorURI";
import {URITargetType} from "../../../../uri/URITargetType";
import {SynScope} from "../../api/scope/SynScope";


/**
 * Represent a syntactic scope in the language parser. A scope will keep track of all of its SynDeclarations and SynCodeBlocks children.
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export class SynScopeImpl implements SynScope {
    public static readonly GLOBAL_SCOPE: SynScope = new SynScopeImpl(SynScopeType.Global, null);

    private children: SynScopeImpl[] = [];

    private declarations: Map<String, SynDeclaration> = new Map<String, SynDeclaration>();

    private codeBlock: SynCodeBlock;
    private childCount: number = 0;
    private readonly scopeId: number;

    constructor(private type: SynScopeType, private readonly parent: SynScopeImpl | null) {
        if (parent) parent.addChildScope(this);
        else this.parent = this;
        this.scopeId = this.parent!.childCount++;
    }

    getURI(): EditorURI {
        if (this.parent !== this) return this.getParent().getURI().extendAnchor(this.type.getDebugName() + this.scopeId.toString());
        return this.codeBlock.getSynDocument().getURI().extendAnchor(this.type.getDebugName() + this.scopeId.toString(), URITargetType.SCOPE);
    }

    getParent(): SynScope {
        return this.parent || this;
    }

    getDeclarations(): Map<String, SynDeclaration> {
        return this.declarations;
    }

    addDeclaration(decl: SynDeclaration) {
        this.declarations.set(decl.getName(), decl);
    }

    addChildScope(scope: SynScopeImpl) {
        this.children.push(scope);
    }

    getType(): SynScopeType {
        return this.type;
    }

    resolve(name: string): SynDeclaration | null {
        const decl = this.declarations.get(name);
        if (decl) return decl;
        if (this.parent !== this) return this.parent!.resolve(name);
        return null;
    }

    setAssociatedCodeBlock(codeBlock: SynCodeBlock): void {
        this.codeBlock = codeBlock;
    }

    getAssociatedCodeBlock(): SynCodeBlock {
        return this.codeBlock;
    }
}
