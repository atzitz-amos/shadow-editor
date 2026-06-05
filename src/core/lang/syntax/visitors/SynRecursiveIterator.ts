import {SynNode} from "../api/SynNode";
import {SynTokenNode} from "../impl/SynTokenNode";
import {SynElementImpl} from "../impl/SynElementImpl";

/**
 *
 * @author Atzitz Amos
 * @date 6/3/2026
 * @since 1.0.0
 */
export class SynRecursiveIterator implements Iterator<SynNode> {
    private _onlyElements = false;
    private _skipSkippableElements = true;
    private _skipComments = true;

    private queue: SynNode[];

    public constructor(private readonly root: SynNode) {
        this.queue = [root];
    }

    next(...[value]: [] | [any]): IteratorResult<SynNode, any> {
        while (this.queue.length > 0) {
            const current = this.queue.pop()!;
            if (this._skipComments && current instanceof SynTokenNode && current.token.isCommentToken()) {
                continue;
            }
            if (this._onlyElements && !(current instanceof SynElementImpl)) {
                continue;
            }
            if (this._skipSkippableElements && current instanceof SynTokenNode && current.token.shouldSkip()) {
                continue;
            }
            // Add children to stack in reverse order to maintain correct traversal order
            for (let i = current.getChildren().length - 1; i >= 0; i--) {
                this.queue.push(current.getChildren()[i]);
            }
            return {value: current, done: false};
        }
        return {value: undefined, done: true};
    }

    return?(value?: any): IteratorResult<SynNode, any> {
        throw new Error("Method not implemented.");
    }

    throw?(e?: any): IteratorResult<SynNode, any> {
        throw new Error("Method not implemented.");
    }

    public skipComments(skip: boolean): SynRecursiveIterator {
        this._skipComments = skip;
        return this;
    }

    public skipSkippableElements(skip: boolean): SynRecursiveIterator {
        this._skipSkippableElements = skip;
        return this;
    }

    public onlyElements(only: boolean): SynRecursiveIterator {
        this._onlyElements = only;
        return this;
    }

    [Symbol.iterator](): Iterator<SynNode> {
        return this;
    }
}
