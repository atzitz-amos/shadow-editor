import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {JsFunctionParameters} from "./JsFunctionParameters";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {JsCodeBlock} from "../JsCodeBlock";
import {JsStatement} from "./JsStatement";
import {JsFunction} from "../api/JsFunction";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsLexicalGrammar} from "../../lexer/JsLexicalGrammar";
import {SynNamedElement} from "../../../../../lang/syntax/impl/reference/SynNamedElement";

/**
 *
 * @author Atzitz Amos
 * @date 12/25/2025
 * @since 1.0.0
 */
export class JsFunctionStatement extends JsStatement implements JsFunction, SynNamedElement {
    private readonly name: SynTokenNode;
    private readonly parameters: JsFunctionParameters;
    private readonly body: JsCodeBlock;
    private readonly asyncToken?: SynTokenNode;

    private readonly generatorToken?: SynTokenNode;

    constructor(node: ASTNode) {
        super(node);

        this.parameters = this.getNthChildOfType(JsFunctionParameters, 0)!;
        this.body = this.getNthChildOfType(JsCodeBlock, 0)!;

        for (let token of this.getAllToken()) {
            if (token.getValue() === "async") {
                if (!this.asyncToken) this.asyncToken = token;
                else this.name = token;
            } else if (token.getValue() === "*") {
                this.generatorToken = token;
            } else if (token.token.getType() === JsLexicalGrammar.IDENTIFIER || token.token.getType() === JsLexicalGrammar.KEYWORD) {
                if (token.getValue() !== "function" && this.name === undefined)
                    this.name = token;
            }
        }

        if (this.asyncToken && !this.name) {
            this.name = this.asyncToken;
            this.asyncToken = undefined;
        }
    }

    isAsync(): boolean {
        return this.asyncToken !== undefined;
    }

    isGenerator(): boolean {
        return this.generatorToken !== undefined;
    }

    isFunctionExpr(): boolean {
        return false;
    }

    getAsyncToken(): SynTokenNode | undefined {
        return this.asyncToken;
    }

    getNameToken(): SynTokenNode | null {
        return this.name || null;
    }

    getName(): string {
        return this.name ? this.name.getValue() : "";
    }

    getParameters(): JsFunctionParameters {
        return this.parameters;
    }

    getBody(): JsCodeBlock {
        return this.body;
    }

    public toDebugString(): string {
        return `(${this.node.type.debugName} ${this.getElementChildren().map(child => child.toDebugString()).join(" ")})`;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitFunctionStatement(this);
            visitor.visitFunction(this);
        }
        visitor.visitNamedElement(this);
        super.accept(visitor);
    }
}
