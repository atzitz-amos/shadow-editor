import {ScopeManager} from "../Scoping";
import {SRCodeBlock, SRNode} from "./ast";
import {IParser} from "./IParser";
import {TokenStream} from "../lexer/TokenStream";

export class SRTree {
    scoping: ScopeManager;
    code: SRCodeBlock;

    parser: IParser<any>;

    constructor(parser: IParser<any>, code: TokenStream<any>) {
        this.scoping = parser.createScopeManager();
        this.code = parser.parse(this.scoping.toplevel(), code);

        this.parser = parser;
    }

    /**
     * Updates the SrTree by replacing the `node` children with the provided `children`.
     */
    patch(node: SRNode, children: SRNode[]): void {
        if ((node as any).children !== undefined) {
            (node as any).children = children;
        } else {
            // We replace the node itself if it does not have children

        }
    }

    getContainingNodeAt(at: Offset): SRCodeBlock {
        return this.scoping.getContainingNodeAt(at) || this.code;
    }

    getScopingModel(): ScopeManager {
        return this.scoping;
    }
}