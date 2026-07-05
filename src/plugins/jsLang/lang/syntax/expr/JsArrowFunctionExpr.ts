import {JsExpr} from "./JsExpr";
import {JsFunction} from "../api/JsFunction";
import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {JsCodeBlock} from "../JsCodeBlock";
import {JsFunctionParameters} from "../statements/JsFunctionParameters";
import {SynTokenNode} from "../../../../../core/lang/syntax/impl/SynTokenNode";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/utils/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 7/3/2026
 * @since 1.0.0
 */
export class JsArrowFunctionExpr extends JsExpr implements JsFunction {
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
                this.asyncToken = token;
            } else if (token.getValue() === "*") {
                this.generatorToken = token;
            }
        }
    }

    isAsync(): boolean {
        return this.asyncToken !== undefined;
    }

    isGenerator(): boolean {
        return this.generatorToken !== undefined;
    }

    getName(): string | null {
        return null;
    }

    getParameters(): JsFunctionParameters {
        return this.parameters;
    }

    getBody(): JsCodeBlock {
        return this.body;
    }

    isFunctionExpr(): boolean {
        return true;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitArrowFunction(this);
        }
        super.accept(visitor);
    }
}
