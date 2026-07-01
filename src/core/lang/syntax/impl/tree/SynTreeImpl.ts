import {SynTree} from "../../api/tree/SynTree";
import {AbstractSynParentElement} from "./AbstractSynParentElement";
import {SynScope} from "../../api/scope/SynScope";
import {TextRange} from "../../../../../editor/core/coordinate/range/TextRange";
import {EditorURI} from "../../../../uri/EditorURI";
import {SynDocument} from "../../api/document/SynDocument";
import {SynNode} from "../../api/SynNode";
import {SynScopeImpl} from "../scope/SynScopeImpl";
import {LanguageBase} from "../../../LanguageBase";
import {SynNodeVisitor} from "../../utils/visitors/SynNodeVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 6/29/2026
 * @since 1.0.0
 */
export class SynTreeImpl extends AbstractSynParentElement implements SynTree {
    private readonly range: TextRange;

    constructor(private readonly language: LanguageBase, children: SynNode[], private readonly document: SynDocument) {
        super(children);

        this.range = TextRange.enclosing(children)
    }

    getParentScope(): SynScope {
        if (this.children.length > 0 && this.children[0].getParentScope()) return this.children[0].getParentScope();
        return SynScopeImpl.GLOBAL_SCOPE;
    }

    getSynDocument(): SynDocument {
        return this.document;
    }

    getTextRange(): TextRange {
        return this.range;
    }

    getLanguage(): LanguageBase {
        return this.language;
    }

    toDebugString(): string {
        const children = this.children.map(child => child.toDebugString()).join(" ");
        return children.length > 0 ? `(SynTree ${children})` : `(SynTree<empty>)`;
    }

    getURI(): EditorURI {
        return this.document.getURI();
    }

    accept(visitor: SynNodeVisitor) {
        visitor.visitTree(this);
        super.accept(visitor);
    }
}
