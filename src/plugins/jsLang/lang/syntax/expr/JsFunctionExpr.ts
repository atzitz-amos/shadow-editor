import {JsExpr} from "./JsExpr";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {JsFunction} from "../api/JsFunction";
import {JsCodeBlock} from "../JsCodeBlock";
import {JsFunctionParameters} from "../statements/JsFunctionParameters";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsLexicalGrammar} from "../../lexer/JsLexicalGrammar";

/**
 *
 * @author Atzitz Amos
 * @date 7/3/2026
 * @since 1.0.0
 */
export class JsFunctionExpr extends JsExpr implements JsFunction {
    private readonly name: SynTokenNode | null = null;
    private readonly parameters: JsFunctionParameters;
    private readonly body: JsCodeBlock;
    private readonly asyncToken?: SynTokenNode;

    private readonly generatorToken?: SynTokenNode;

    constructor(node: ASTNode) {
        super(node);

        this.parameters = this.getNthChildOfType(JsFunctionParameters, 0)!;
        this.body = this.getNthChildOfType(JsCodeBlock, 0)!;
        this.generatorToken = this.getAllTokensOfType(JsLexicalGrammar.MATHEMATICAL_OPERATOR)[0];

        let i = 0;
        const allToken = this.getAllToken().filter(x => x.token.getType() === JsLexicalGrammar.IDENTIFIER || x.token.getType() === JsLexicalGrammar.KEYWORD);
        if (allToken[i].getValue() === "async") {
            this.asyncToken = allToken[i++];
        }
        i++; // "function" keyword

        this.name = allToken[i];
    }

    getAsyncToken(): SynTokenNode | undefined {
        return this.asyncToken;
    }

    getNameToken(): SynTokenNode | null {
        return this.name ?? null;
    }

    getParameters(): JsFunctionParameters {
        return this.parameters;
    }

    getBody(): JsCodeBlock {
        return this.body;
    }

    isGenerator(): boolean {
        return this.generatorToken !== undefined;
    }

    isAsync(): boolean {
        return this.asyncToken !== undefined;
    }

    isFunctionExpr(): boolean {
        return true;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitFunctionExpr(this);
            visitor.visitFunction(this);
        }
        super.accept(visitor);
    }
}
