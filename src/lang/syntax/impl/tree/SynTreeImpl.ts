import {SynTree} from "../../api/tree/SynTree";
import {AbstractSynParentElement} from "./AbstractSynParentElement";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {EditorURI} from "../../../../core/uri/EditorURI";
import {SynDocument} from "../../api/document/SynDocument";
import {SynNode} from "../../api/SynNode";
import {LanguageBase} from "../../../LanguageBase";
import {SynNodeVisitor} from "../../visitors/SynNodeVisitor";
import {SynGlobalScope} from "../../../indexes/scope/SynGlobalScope";
import {SynCodeBlock} from "../../api/SynCodeBlock";

/**
 *
 * @author Atzitz Amos
 * @date 6/29/2026
 * @since 1.0.0
 */
export class SynTreeImpl extends AbstractSynParentElement implements SynTree {
    private readonly range: TextRange;
    private readonly codeblock: SynCodeBlock;
    private readonly globalScope: SynGlobalScope;

    private readonly text: string;

    constructor(private readonly language: LanguageBase, children: SynNode[], private readonly document: SynDocument) {
        super(children);

        this.range = TextRange.enclosing(children)
        this.text = document.getDocument().getTextBetween(this.range.getStart(), this.range.getEnd());

        const codeblock = this.children.find(child => child instanceof SynCodeBlock);
        this.codeblock = codeblock as SynCodeBlock;
        this.globalScope = new SynGlobalScope(this.codeblock);
    }

    getText(): string {
        return this.text;
    }

    getToplevelCodeblock(): SynCodeBlock {
        return this.codeblock;
    }

    getGlobalScope(): SynGlobalScope {
        return this.globalScope;
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

    getTokenCount(): number {
        return this.children.reduce((count, child) => count + child.getTokenCount(), 0);
    }
}
