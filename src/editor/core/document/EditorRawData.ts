import {TextRange} from "../coordinate/TextRange";

class RopeNode {
    weight: number;
    left: RopeNode | null;
    right: RopeNode | null;
    value: string | null;

    constructor(value: string | null = null, left: RopeNode | null = null, right: RopeNode | null = null) {
        this.value = value;
        this.left = left;
        this.right = right;

        if (value !== null) {
            this.weight = value.length;
        } else if (left) {
            this.weight = left.getTotalWeight();
        } else {
            this.weight = 0;
        }
    }

    isLeaf(): boolean {
        return this.left === null && this.right === null;
    }

    getTotalWeight(): number {
        if (this.isLeaf()) {
            return this.value ? this.value.length : 0;
        }
        return (this.left ? this.left.getTotalWeight() : 0) + (this.right ? this.right.getTotalWeight() : 0);
    }
}

export class EditorRawData {
    root: RopeNode;

    constructor(initialString: string = "") {
        this.root = new RopeNode(initialString);
    }

    concat(rope: EditorRawData): void {
        this.root = new RopeNode(null, this.root, rope.root);
        this.root.weight = this.root.left!.getTotalWeight();
    }

    index(i: number): string {
        return this._index(this.root, i);
    }

    toString(): string {
        return this._toString(this.root);
    }

    split(index: number): [EditorRawData, EditorRawData] {
        const [left, right] = this._split(this.root, index);
        const leftRope = new EditorRawData();
        leftRope.root = left;
        const rightRope = new EditorRawData();
        rightRope.root = right;
        return [leftRope, rightRope];
    }

    insert(index: number, str: string): void {
        const [left, right] = this.split(index);
        const middle = new EditorRawData(str);
        left.concat(middle);
        left.concat(right);
        this.root = left.root;
    }

    delete(start: number, length: number): string {
        const [left, temp] = this.split(start);
        const [value, right] = temp.split(length);
        left.concat(right);
        this.root = left.root;
        return value.toString();
    }

    length(): number {
        return this.root.getTotalWeight();
    }

    substring(start: Offset, end?: Offset): string {
        if (end === undefined) {
            end = this.length();
        }
        if (start < 0 || end > this.length() || start > end) {
            throw new Error("Invalid range for substring");
        }
        return this._toString(this.root).substring(start, end);
    }

    getTextInRange(range: TextRange): string {
        return this.substring(range.start, range.end);
    }

    private _index(node: RopeNode, i: number): string {
        if (node.isLeaf()) {
            if (!node.value || i >= node.value.length) throw new Error("Index out of bounds");
            return node.value[i];
        }

        if (i < node.weight) {
            return this._index(node.left!, i);
        } else {
            return this._index(node.right!, i - node.weight);
        }
    }

    private _toString(node: RopeNode): string {
        if (node.isLeaf()) {
            return node.value ?? "";
        }
        return this._toString(node.left!) + this._toString(node.right!);
    }

    private _split(node: RopeNode, index: number): [RopeNode, RopeNode] {
        if (node.isLeaf()) {
            const leftStr = node.value!.substring(0, index);
            const rightStr = node.value!.substring(index);
            return [new RopeNode(leftStr), new RopeNode(rightStr)];
        }

        if (index < node.weight) {
            const [leftSplit, rightSplit] = this._split(node.left!, index);
            const newRight = new RopeNode(null, rightSplit, node.right);
            return [leftSplit, newRight];
        } else {
            const [leftSplit, rightSplit] = this._split(node.right!, index - node.weight);
            const newLeft = new RopeNode(null, node.left, leftSplit);
            newLeft.weight = node.left!.getTotalWeight();
            return [newLeft, rightSplit];
        }
    }
}