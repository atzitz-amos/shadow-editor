import {SynASTElement} from "../../syntax/api/tree/SynASTElement";
import {SynASTElementImpl} from "../../syntax/impl/tree/SynASTElementImpl";
import {SynTokenNode} from "../../syntax/impl/SynTokenNode";
import {Token} from "../../syntax/builder/tokens/Token";
import {SynChildrenIterator} from "../../syntax/visitors/SynChildrenIterator";
import {SynTree} from "../../syntax/api/tree/SynTree";

/**
 *
 * @author Atzitz Amos
 * @date 8/15/2026
 * @since 1.0.0
 */
export class SynTreeTokenJumper {
    private readonly iterator: SynChildrenIterator;

    /** How many levels below the iterator's initial (top) level we've
     *  descended via our own enter() calls. Lets us know when we've hit the
     *  top level, since SynChildrenIterator.exit() throws in that case and
     *  doesn't expose its stack depth. */
    private depth: number = 0;

    public constructor(private readonly tree: SynTree) {
        this.iterator = new SynChildrenIterator(tree);
    }

    /**
     * Walks forward through the tree (continuing from wherever the previous
     * call left off) until it finds the node representing `token`, then
     * returns that node's nearest SynASTElementImpl ancestor (or itself).
     * Returns null if `token` doesn't appear anywhere in the remainder of
     * the tree.
     */
    public jumpToToken(token: Token): SynASTElement | null {
        while (true) {
            const current = this.iterator.getCurrent();

            if (current === null) {
                if (!this.moveToNextSibling()) {
                    return null; // Tree exhausted - token not found.
                }
                continue;
            }

            if (current instanceof SynTokenNode && current.token === token) {
                break;
            }

            if (this.iterator.canRecurseInto()) {
                this.iterator.enter();
                this.depth++;
            } else if (!this.moveToNextSibling()) {
                return null;
            }
        }

        // Climb from the token node up to the nearest SynASTElementImpl
        // ancestor (or itself).
        while (this.depth > 0 && !(this.iterator.getCurrent() instanceof SynASTElementImpl)) {
            this.iterator.exit();
            this.depth--;
        }

        return this.iterator.getCurrent() as SynASTElement | null;
    }

    /** Moves to the next sibling at the current level, climbing up through
     *  exhausted ancestor levels as necessary. Returns false once there's
     *  nowhere left to go (the whole remaining tree has been walked). */
    private moveToNextSibling(): boolean {
        while (!this.iterator.hasNextSibling()) {
            if (this.depth === 0) return false;
            this.iterator.exit();
            this.depth--;
        }
        this.iterator.nextSibling();
        return true;
    }
}
