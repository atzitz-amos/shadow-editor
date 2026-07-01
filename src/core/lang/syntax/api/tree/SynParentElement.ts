import {SynNode} from "../SynNode";
import {SynTokenNode} from "../../impl/SynTokenNode";
import {TokenType} from "../../builder/tokens/TokenType";

/**
 *
 * @author Atzitz Amos
 * @date 6/29/2026
 * @since 1.0.0
 */
export interface SynParentElement extends SynNode {
    childrenIterator(filter: (element: SynParentElement) => boolean): Iterable<SynParentElement>;

    getImmediateChildrenAt(offset: number): SynNode | null;

    getDeepestChildAt(offset: number): SynNode | null;

    findFirstChildOfTypeAt<T extends SynParentElement>(type: Class<T>, offset: Offset): T | null;

    getEnclosingOfType<T extends SynParentElement>(type: Class<T>): T | null;

    getAllChildrenOfType<T extends SynParentElement>(type: Class<T>, nested?: boolean): T[];

    getAllTokensOfType(type: TokenType, nested?: boolean): SynTokenNode[];

    getNthChild(n: number): SynNode | null;

    getNthChildOfType<T extends SynParentElement>(type: Class<T>, n: number): T | undefined;

    getAllToken(nested: boolean): SynTokenNode[];

    setSynthetic(): void;
}
