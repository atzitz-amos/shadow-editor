import {SynScopeType} from "./SynScopeType";
import {SynCodeBlock} from "../../../api/SynCodeBlock";
import {SynDeclaration} from "../../../impl/SynDeclaration";
import {URILocatedResource} from "../../../../../uri/URILocatedResource";
import {EditorURI} from "../../../../../uri/EditorURI";
import {URITargetType} from "../../../../../uri/URITargetType";


/**
 * Represent a syntactic scope in the language parser. A scope will keep track of all of its SynDeclarations and SynCodeBlocks children.
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export interface SynScope extends URILocatedResource {
    getType(): SynScopeType;

    getAssociatedCodeBlock(): SynCodeBlock;

    getParent(): SynScope;

    getDeclarations(): Map<String, SynDeclaration>;

    resolve(name: string): SynDeclaration | null;
}

export class SynScopeImpl implements SynScope {
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
        return this.codeBlock.getSynFile().getURI().extendAnchor(this.type.getDebugName() + this.scopeId.toString(), URITargetType.SCOPE);
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
