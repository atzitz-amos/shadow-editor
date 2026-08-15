import {SynTree} from "../../syntax/api/tree/SynTree";
import {SynASTElement} from "../../syntax/api/tree/SynASTElement";
import {SynChildrenIterator} from "../../syntax/visitors/SynChildrenIterator";
import {SynASTElementImpl} from "../../syntax/impl/tree/SynASTElementImpl";

/**
 *
 * @author Atzitz Amos
 * @date 8/15/2026
 * @since 1.0.0
 */
export class SynTreeOffsetJumper {
    private readonly iterator: SynChildrenIterator;

    private currentOffset: number = -1;

    /** How many levels below the iterator's initial (top) level we've
     *  descended via our own enter() calls. Lets us know when we've hit the
     *  top level, since SynChildrenIterator.exit() throws in that case and
     *  doesn't expose its stack depth. */
    private depth: number = 0;

    public constructor(private readonly tree: SynTree) {
        this.iterator = new SynChildrenIterator(tree);
    }

    public jumpToOffset(offset: number): SynASTElement | null {
        if (offset <= this.currentOffset) {
            throw new Error(`Cannot jump to offset ${offset} which is less than or equal to current offset ${this.currentOffset}`);
        }
        this.currentOffset = offset;

        while (true) {
            const current = this.iterator.getCurrent();

            if (current === null) {
                if (!this.skipToNextSibling()) {
                    return null; // Tree exhausted - offset is out of range.
                }
                continue;
            }

            const range = current.getTextRange();

            if (range.end <= offset) {
                // Entire subtree ends before the offset: skip it wholesale.
                if (!this.skipToNextSibling()) {
                    return null;
                }
                continue;
            }

            if (range.start > offset) {
                // Offset falls in a gap not covered by any node here.
                break;
            }

            // range.start <= offset < range.end: this node covers the offset.
            if (this.iterator.canRecurseInto()) {
                this.iterator.enter();
                this.depth++;
            } else {
                break; // Leaf covering the offset - this is the deepest node.
            }
        }

        while (this.depth > 0 && !(this.iterator.getCurrent() instanceof SynASTElementImpl)) {
            this.iterator.exit();
            this.depth--;
        }

        return this.iterator.getCurrent() as SynASTElement | null;
    }

    /** Moves to the next sibling at the current level, climbing up through
     *  exhausted ancestor levels (that we ourselves descended into) as
     *  necessary. Returns false once there's nowhere left to go. */
    private skipToNextSibling(): boolean {
        while (!this.iterator.hasNextSibling()) {
            if (this.depth === 0) return false;
            this.iterator.exit();
            this.depth--;
        }
        this.iterator.nextSibling();
        return true;
    }
}