import {JsClassMember} from "./JsClassMember";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {JsSynUtils} from "../utils/JsSynUtils";
import {JsClassPropertyKey} from "./JsClassPropertyKey";
import {JsClassUtils} from "./JsClassUtils";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export class JsClassField extends JsClassMember {
    private readonly name: JsClassPropertyKey;
    private readonly staticToken: SynTokenNode | undefined;

    constructor(node: ASTNode) {
        super(node);

        let j: number;
        [j, this.staticToken] = JsSynUtils.mapSimpleToken(this, 0, ["static"]);

        this.name = JsClassUtils.getClassMemberName(this, j);
    }

    getName(): JsClassPropertyKey {
        return this.name;
    }

    getStaticToken(): SynTokenNode | undefined {
        return this.staticToken;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitClassField(this);
        }

        super.accept(visitor);
    }
}
