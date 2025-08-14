import {ILanguageReference, IScope, ScopeManager} from "../../core/lang/Scoping";
import {TextRange} from "../../core/Position";
import {JSCodeBlock, JSDeclStmt, JSFuncDecl, JSLambda} from "./jsNodes";
import {EditorInstance} from "../../EditorInstance";
import {SRCodeBlock} from "../../core/lang/parser/ast";


export class JSScopeManager implements ScopeManager {
    globalScope: JSGlobalScope = new JSGlobalScope(this);

    constructor() {
    }

    toplevel(): JSGlobalScope {
        return this.globalScope;
    }

    fullRange(): TextRange {
        return EditorInstance.Instance.getFullRange();
    }

    getContainingNodeAt(at: Offset): SRCodeBlock | null {
        let scope = this.getScopeAt(at);
        if (scope.kind === JSScopeKind.FUNCTION) {
            return (scope as JSFunctionScope).func.body?.body || null;
        }
        return null;
    }

    getScopeAt(offset: Offset): JSScope {
        return this.recursiveGetScopeAt(this.globalScope, offset) || this.globalScope;
    }

    private recursiveGetScopeAt(scope: JSScope, offset: Offset): JSScope | null {
        if (scope.range.contains(offset)) {
            for (const child of scope.children) {
                const found = this.recursiveGetScopeAt(child, offset);
                if (found) {
                    return found.isVirtual() ? found.parent : found;
                }
            }
            return scope;
        }
        return null;
    }
}

export enum JSScopeKind {
    GLOBAL = "global",
    FUNCTION = "function",
    BLOCK = "block"
}

export class JSReference implements ILanguageReference {
    decl: JSFuncDecl | JSDeclStmt;
    loc: TextRange;
    scope: JSScope;
    scopeKind: JSScopeKind;

    constructor(decl: JSFuncDecl | JSDeclStmt, scope: JSScope) {
        this.decl = decl;
        this.loc = decl.range;
        this.scope = scope;
        this.scopeKind = scope.kind;
    }
}

export class JSScope implements IScope {
    manager: JSScopeManager;
    range: TextRange;
    children: JSScope[] = [];
    parent: JSScope | null;
    kind: JSScopeKind;

    declarations: Map<string, JSReference> = new Map();

    constructor(parent: JSScope | null) {
        this.parent = parent;
        if (parent) {
            this.manager = parent.manager;
            parent.children.push(this);
        }
    }

    isVirtual(): boolean {
        return this.kind === JSScopeKind.BLOCK && !!this.parent && this.parent.kind !== JSScopeKind.BLOCK;
    }

    newBlockScope(): JSBlockScope {
        return new JSBlockScope(this);
    }

    newFuncScope(): JSFunctionScope {
        return new JSFunctionScope(this);
    }

    pop(): JSScope {
        if (this.parent) {
            return this.parent;
        } else {
            return this;
        }
    }

    declare(name: string, decl: JSFuncDecl | JSDeclStmt) {
        if (this.isVirtual()) {
            // If this is a virtual scope (like a block scope inside a function), we should not declare the variable in the block scope.
            this.parent!.declare(name, decl);
            return;
        }
        this.declarations.set(name, new JSReference(decl, this));
    }

    resolve(this: JSScope, name: string): JSReference | null {
        let scope: JSScope | null = this;
        while (scope) {
            if (scope.exists(name)) {
                return scope.declarations.get(name) || null;
            }
            scope = scope.parent;
        }
        return null;
    }

    exists(this: JSScope, name: string): boolean {
        return this.declarations.has(name);
    }

    clear(): void {
        this.declarations.clear();
        this.children = [];
    }
}

export class JSGlobalScope extends JSScope {
    kind = JSScopeKind.GLOBAL;

    constructor(manager: JSScopeManager) {
        super(null);
        this.manager = manager;
        this.range = manager.fullRange();
    }
}

export class JSFunctionScope extends JSScope {
    kind = JSScopeKind.FUNCTION;
    func: JSFuncDecl | JSLambda;
}

export class JSBlockScope extends JSScope {
    kind = JSScopeKind.BLOCK;
    block: JSCodeBlock;

}
