import {JsClassMember} from "./JsClassMember";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {JsCodeBlock} from "../JsCodeBlock";
import {JsFunctionParameters} from "../statements/JsFunctionParameters";
import {JsSynUtils} from "../utils/JsSynUtils";
import {JsClassPropertyKey} from "./JsClassPropertyKey";
import {JsClassUtils} from "./JsClassUtils";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export class JsClassMethod extends JsClassMember {

    private readonly staticToken: SynTokenNode | undefined;
    private readonly asyncToken: SynTokenNode | undefined;
    private readonly generatorToken: SynTokenNode | undefined;

    private readonly name: JsClassPropertyKey;
    private readonly parameters: JsFunctionParameters;
    private readonly body: JsCodeBlock;

    constructor(node: ASTNode) {
        super(node);

        let j: number;
        [j, this.staticToken, this.asyncToken, this.generatorToken] = JsSynUtils.mapSimpleToken(this, 0, ["static", "async", "*"]);

        this.name = JsClassUtils.getClassMemberName(this, j);
    }

    getName(): JsClassPropertyKey {
        return this.name;
    }

    getStaticToken(): SynTokenNode | undefined {
        return this.staticToken;
    }

    isGenerator(): boolean {
        return this.generatorToken !== undefined;
    }

    isAsync(): boolean {
        return this.asyncToken !== undefined;
    }

    getGeneratorToken(): SynTokenNode | undefined {
        return this.generatorToken;
    }

    getAsyncToken(): SynTokenNode | undefined {
        return this.asyncToken;
    }

    getParameters(): JsFunctionParameters {
        return this.parameters;
    }

    getBody(): JsCodeBlock {
        return this.body;
    }


    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitClassMethod(this);
        }

        super.accept(visitor);
    }
}


class a {
    y() {
        this.#x();
    }

    #x() {

    }
}