import {SynNode} from "./SynNode";
import {SynScope} from "../builder/parser/scopes/SynScope";
import {ASTType} from "../builder/parser/nodes/ASTGrammar";
import {TokenType} from "../builder/tokens/TokenType";
import {SynTokenNode} from "../impl/SynTokenNode";

export interface SynElement extends SynNode {
    childrenIterator(filter: (element: SynElement) => boolean): Iterable<SynElement>;

    getElementChildren(): SynElement[];

    findChildrenAt(offset: number): SynNode | null;

    findDeepestChildAt(offset: number): SynNode | null;

    findFirstChildOfTypeAt<T extends SynElement>(type: Class<T>, offset: Offset): T | null;

    findEnclosingOfType<T extends SynElement>(type: Class<T>): T | null;

    findAllChildrenOfType<T extends SynElement>(type: Class<T>, nested?: boolean): T[];

    findAllTokensOfType(type: TokenType, nested?: boolean): SynTokenNode[];

    getParentScope(): SynScope;

    findNthChild(n: number): SynNode | null;

    findNthChildOfType<T extends SynElement>(type: Class<T>, n: number): T | undefined;

    findNthElementOfASTType(type: ASTType, n: number): SynElement | null;

    getAllToken(nested: boolean): SynTokenNode[];
}