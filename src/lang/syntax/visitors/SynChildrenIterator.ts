import {SynNode} from "../api/SynNode";
import {SynParentElement} from "../api/tree/SynParentElement";

type Frame = {
    /** The sibling list at this level (a snapshot taken via getChildren()). */
    siblings: SynNode[];
    /** Index of the current element within `siblings`. Equal to
     *  `siblings.length` means "past the last sibling" at this level. */
    index: number;
};

/**
 * A cursor over the children of a SynParentElement. The cursor can move
 * between siblings and can descend into / climb out of nested parent
 * elements, similar to a manual, controllable depth-first-search walk.
 */
export class SynChildrenIterator {
    // Stack of frames from the root (the children of the element passed to the
    // constructor) down to the level we're currently positioned in. The
    // bottom-most (index 0) frame can never be popped.
    private readonly stack: Frame[];

    constructor(parent: SynParentElement) {
        this.stack = [{siblings: parent.getChildren(), index: 0}];
    }

    private get topFrame(): Frame {
        return this.stack[this.stack.length - 1];
    }

    /** The element currently pointed at, or null if there is none. */
    getCurrent(): SynNode | null {
        const frame = this.topFrame;
        return frame.index < frame.siblings.length ? frame.siblings[frame.index] : null;
    }

    /** True when there is a next element in the traversal (without advancing). */
    hasNext(): boolean {
        // If the current element can be recursed into, next() will descend.
        if (this.canRecurseInto()) {
            return true;
        }
        // Check current level and all ancestor levels for a next sibling.
        for (let i = this.stack.length - 1; i >= 0; --i) {
            const frame = this.stack[i];
            if (frame.index + 1 < frame.siblings.length) {
                return true;
            }
        }
        return false;
    }

    /** True when the current element is itself a SynParentElement. */
    canRecurseInto(): boolean {
        const current = this.getCurrent();
        return current !== null && current.isParentElement();
    }

    /** True when there is a sibling after the current one at this level. */
    hasNextSibling(): boolean {
        const frame = this.topFrame;
        return frame.index + 1 < frame.siblings.length;
    }

    /** Moves to the next sibling at the current level. Returns the new current element, or null. */
    nextSibling(): SynNode | null {
        const frame = this.topFrame;
        if (frame.index < frame.siblings.length) {
            frame.index += 1;
        }
        return this.getCurrent();
    }

    /** Moves to the previous sibling at the current level. Returns the new current element, or null. */
    previousSibling(): SynNode | null {
        const frame = this.topFrame;
        if (frame.index <= 0) {
            return null;
        }
        frame.index -= 1;
        return this.getCurrent();
    }

    /**
     * Descends into the current element's children.
     * Throws if there is no current element, or if it is not a SynParentElement.
     */
    enter(): void {
        const current = this.getCurrent();
        if (current === null) {
            throw new Error('ChildrenIterator.enter(): there is no current element to enter');
        }
        if (!current.isParentElement()) {
            throw new Error('ChildrenIterator.enter(): the current element cannot be recursed into');
        }
        this.stack.push({siblings: current.getChildren(), index: 0});
    }

    /**
     * Leaves the current level, landing back on the element that was entered
     * to reach it. Throws if already at the top level.
     */
    exit(): void {
        if (this.stack.length <= 1) {
            throw new Error('ChildrenIterator.exit(): already at the top level');
        }
        this.stack.pop();
    }

    /**
     * Advances one step in a pre-order, depth-first walk: enters the current
     * element when possible, otherwise moves to the next sibling, climbing
     * upward (like repeated exit()) as many levels as necessary. Returns the
     * new current element, or null once the whole (sub)tree has been
     * exhausted. Never throws.
     */
    next(): SynNode | null {
        if (this.canRecurseInto()) {
            this.enter();
        }

        // If we just entered an element with no children (or otherwise landed
        // on an exhausted level), keep advancing until something is found.
        this.advance();

        return this.getCurrent();
    }

    /**
     * Moves to the next sibling at the current level; if there is none, pops
     * upward through ancestor levels until a level with a next sibling is
     * found. Returns false if it runs out of levels entirely (the top-level
     * frame itself has no next sibling), in which case the iterator is left
     * in the "done" state.
     */
    private advance(): boolean {
        while (!this.hasNextSibling()) {
            if (this.stack.length === 1) {
                // Nothing left anywhere: mark the top level exhausted so
                // getCurrent()/isDone() correctly report completion.
                this.topFrame.index = this.topFrame.siblings.length;
                return false;
            }
            this.stack.pop();
        }
        this.nextSibling();
        return true;
    }
}
