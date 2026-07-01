import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {JsFunctionParameters} from "./JsFunctionParameters";
import {SynTokenNode} from "../../../../../core/lang/syntax/impl/SynTokenNode";
import {JsCodeBlock} from "../JsCodeBlock";
import {JsStatement} from "./JsStatement";

/**
 *
 * @author Atzitz Amos
 * @date 12/25/2025
 * @since 1.0.0
 */
export class JsFunction extends JsStatement {
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
                this.asyncToken = token;
            } else if (token.getValue() === "*") {
                this.generatorToken = token;
            } else if (token.getValue() !== "function" && this.name === undefined) {
                this.name = token;
            }
        }
    }

    getName(): string {
        return this.name.getValue();
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
}
