import {LanguageBase} from "../../../../core/lang/LanguageBase";
import {AbstractSynTemplate} from "../../../../core/lang/syntax/writer/template/AbstractSynTemplate";
import JsLang from "../JsLang";
import {SynNodeVisitor} from "../../../../core/lang/syntax/utils/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../syntax/visitors/JsSynVisitor";
import {JsIdentifier} from "../syntax/literal/JsIdentifier";
import {JsMemberAccessExpr} from "../syntax/expr/JsMemberAccessExpr";
import {SynNode} from "../../../../core/lang/syntax/api/SynNode";

/**
 *
 * @author Atzitz Amos
 * @date 6/6/2026
 * @since 1.0.0
 */
export class JsSynTemplate extends AbstractSynTemplate {
    public getLanguage(): LanguageBase {
        return JsLang.class;
    }

    protected visitReplaceableNodes(callback: (node: SynNode, name: string) => void): SynNodeVisitor {
        return new class extends JsSynVisitor {
            visitIdentifier(element: JsIdentifier) {
                callback(element, element.getName());
            }

            visitMemberAccessExpr(element: JsMemberAccessExpr) {
                callback(element.getProperty(), element.getProperty().getValue());
            }
        }
    }

}
