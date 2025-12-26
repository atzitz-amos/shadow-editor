import {SynNode} from "./SynNode";
import {SynScope} from "../../parser/scopes/SynScope";

export interface SynElement extends SynNode {
    childrenIterator(filter: (element: SynElement) => boolean): Iterable<SynElement>;

    getElementChildren(): SynElement[];

    findChildrenAt(offset: number): SynNode | null;

    findFirstChildOfType<T extends SynElement>(type: Class<T>, offset: Offset): T | null;

    findEnclosingOfType<T extends SynElement>(type: Class<T>): T | null;

    findAllChildrenOfType<T extends SynElement>(type: Class<T>): T[];

    getParentScope(): SynScope;
}