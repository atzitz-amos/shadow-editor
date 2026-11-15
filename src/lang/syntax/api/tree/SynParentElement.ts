import {SynNode} from "../SynNode";
import {SynTokenNode} from "../../impl/SynTokenNode";
import {TokenType} from "../../builder/tokens/TokenType";
import {SynScopedElement} from "./SynScopedElement";

/**
 *
 * @author Atzitz Amos
 * @date 6/29/2026
 * @since 1.0.0
 */
export interface SynParentElement extends SynNode {
    childrenIterator(filter: (element: SynParentElement) => boolean): Iterable<SynParentElement>;

    getImmediateChildrenAt(offset: number, lean?: 'left' | 'right'): SynNode | null;

    /**
     * At a boundary between two tokens, `'left'` (the default) returns the token ending at `offset`,
     * `'right'` the token starting at it.
     */
    getDeepestChildAt(offset: number, lean?: 'left' | 'right'): SynNode | null;

    findFirstChildOfTypeAt<T extends SynParentElement>(type: Class<T>, offset: Offset): T | null;

    getEnclosingOfType<T extends SynParentElement>(type: Class<T>): T | null;

    getEnclosingSuchThat(predicate: (element: SynParentElement) => boolean): SynParentElement | null;

    getAllChildrenOfType<T extends SynParentElement>(type: Class<T>, nested?: boolean): T[];

    getAllTokensOfType(type: TokenType, nested?: boolean): SynTokenNode[];

    getNthChild(n: number, ignoreError?: boolean): SynNode | null;

    getNthChildOfType<T extends SynParentElement>(type: Class<T>, n: number): T | undefined;

    getAllToken(nested: boolean): SynTokenNode[];

    setSynthetic(): void;

    isParentElement(): this is SynParentElement;

    isScopedElement(): this is SynScopedElement;
}
