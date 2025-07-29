import {HasRange, TextRange} from "../Position";
import {SRCodeBlock, SRNode} from "./parser/ast";

export interface ScopeManager {

    /**
     * Return the scope corresponding to the toplevel of the program */
    toplevel(): IScope;

    getScopeAt(offset: Offset): IScope;

    getContainingNodeAt(at: Offset): SRCodeBlock | null;
}

export interface ILanguageReference {
    /**
     * The declaration node that this reference points to.
     */
    decl: SRNode;

    /**
     * The location in the source code where this reference occurs.
     */
    loc: TextRange;

    /**
     * The scope in which this reference is defined.
     */
    scope: IScope;

    /**
     * The kind of scope (e.g., global, function, block).
     */
    scopeKind: string;
}

export interface IScope extends HasRange {
    parent: IScope | null;
    children: IScope[];

    pop(): IScope;

    declare(name: string, decl: SRNode): void;

    resolve(name: string): ILanguageReference | null;

    exists(name: string): boolean;

    clear(): void;
}