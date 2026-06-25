import {SynNode} from "../api/SynNode";
import {SourceModificationRecord} from "../writer/SourceModificationRecord";
import {AbstractSynTemplate} from "./AbstractSynTemplate";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {SourceRewriter} from "../writer/SourceRewriter";
import {LanguageBase} from "../../LanguageBase";
import {SynElement} from "../api/SynElement";
import {SynTokenNode} from "../impl/SynTokenNode";
import {TokenType} from "../builder/tokens/TokenType";

/**
 *
 * @author Atzitz Amos
 * @date 6/6/2026
 * @since 1.0.0
 */
export class SynModificationTree {

    private readonly modifications: SourceModificationRecord[] = [];

    constructor(private readonly lang: LanguageBase, private readonly root: SynNode, private readonly text: string) {
    }


    getOriginal(): string {
        return this.text;
    }

    applyModifications(): SourceModificationRecord {
        // Sort them by decreasing position, so that we can replace them without affecting the positions of the remaining nodes
        const sortedModifications = this.modifications.sort((a, b) => b.range.start - a.range.start);
        let modifiedText = new SourceRewriter(this.lang.getPrinter()).rewriteWithSource(this.root, this.text);
        for (const modification of sortedModifications) {
            modifiedText = modifiedText.slice(0, modification.range.start) + modification.newText + modifiedText.slice(modification.range.end);
        }
        return new SourceModificationRecord(new TextRange(0, modifiedText.length), modifiedText);
    }

    public replaceNode(oldNode: SynNode, newNode: AbstractSynTemplate) {
        this.modifications.push(new SourceModificationRecord(oldNode.getTextRange(), newNode.getText()));
    }

    public insertBefore(node: SynNode, newNode: AbstractSynTemplate) {
        const parent = node.getParent();
        if (!parent) {
            throw new Error("Cannot insert before a node without a parent");
        }
        const siblings = parent.getChildren();
        const index = siblings.indexOf(node);
        if (index === -1) {
            throw new Error("Node not found in parent's children");
        }

        // we modify the parent children and set it to synthetic so that it will be rewritten by the SourceRewriter
        (parent as any).children = [...siblings.slice(0, index), newNode, ...siblings.slice(index)];
        (parent as SynElement).setSynthetic();
    }

    public insertAfter(node: SynNode, newNode: AbstractSynTemplate) {
        const parent = node.getParent();
        if (!parent) {
            throw new Error("Cannot insert after a node without a parent");
        }
        const siblings = parent.getChildren();
        const index = siblings.indexOf(node);
        if (index === -1) {
            throw new Error("Node not found in parent's children");
        }

        // we modify the parent children and set it to synthetic so that it will be rewritten by the SourceRewriter
        (parent as any).children = [...siblings.slice(0, index + 1), newNode, ...siblings.slice(index + 1)];
        (parent as SynElement).setSynthetic();
    }

    removeNode(node: SynNode) {
        this.modifications.push(new SourceModificationRecord(node.getTextRange(), ""));
    }

    replaceToken(parent: SynElement, token: SynTokenNode, type: TokenType, value: string) {
        this.modifications.push(new SourceModificationRecord(token.getTextRange(), value));
    }
}
