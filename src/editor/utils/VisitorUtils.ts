import {TokenStream} from "../lang/tokens/TokenStream";
import {SRNode} from "../core/lang/parser/ast";

export type VisitorImpl<T extends string, R = void> = {
    [key in T as `visit${key}`]?: (token: Token<T>) => R;
};

export type SrNodeVisitorImpl_1<NT extends string, R = void> = {
    [key in NT as `visitNode${key}`]?: <J extends SRNode> (node: J) => R;
};

export type SrNodeVisitorImpl_2<TT extends string, R = void> = {
    [key in TT as `visitToken${key}`]?: <J extends Token<TT>>(token: J) => R;
};

export type SrNodeVisitorImpl<NT extends string, TT extends string, R = void> =
    SrNodeVisitorImpl_1<NT, R>
    & SrNodeVisitorImpl_2<TT, R>;

export class TokenVisitor {
    static visit<T extends string, R = void>(stream: TokenStream<T>, impl: VisitorImpl<T, R>): R[] {
        let results: R[] = [];
        while (!stream.isEmpty()) {
            const token = stream.consume();
            if (token) {
                const visitMethod = impl[`visit${token.type}`] as ((token: Token<T>) => R) | undefined;
                if (visitMethod) {
                    let visited = visitMethod(token);
                    if (visited instanceof Array) {
                        results.push(...visited);
                    } else if (visited !== undefined && visited !== null) {
                        results.push(visited);
                    }
                }
            }
        }

        return results;
    }
}


export class SrNodeVisitor {
    static visitAll<NodeType extends string, TokenType extends string, R = void>(nodes: (SRNode | Token<TokenType>)[], impl: SrNodeVisitorImpl<NodeType, TokenType, R>): R[] {
        let result: R[] = [];
        for (let node of nodes) result = result.concat(SrNodeVisitor.recursiveVisit(node, impl));
        return result;
    }

    static recursiveVisit<NodeType extends string, TokenType extends string, R = void>(node: SRNode | Token<any>, impl: SrNodeVisitorImpl<NodeType, TokenType, R>): R[] {
        if (node instanceof Token) {
            let visitMethod = impl[`visitToken${node.type}`] as ((token: Token<any>) => R) | undefined;
            if (visitMethod) {
                let visited = visitMethod(node);
                if (visited !== undefined && visited !== null) {
                    return [visited];
                }
            }
        } else {
            let results: R[] = [];

            let visitMethod = impl[`visitNode${node.nodeType}`] as ((node: SRNode) => R) | undefined;
            if (visitMethod) {
                let visited = visitMethod(node);
                if (visited !== undefined && visited !== null) {
                    results.push(visited);
                }
            }
            for (let value of node.getNodeContent()) {
                results = results.concat(this.recursiveVisit(value, impl));
            }
            return results;
        }
        return [];
    }
}