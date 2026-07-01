import {LanguageBase} from "../../../LanguageBase";
import {SynNode} from "../../api/SynNode";
import {TextRange} from "../../../../../editor/core/coordinate/range/TextRange";
import {EditorURI} from "../../../../uri/EditorURI";
import {SynASTElement} from "../../api/tree/SynASTElement";
import {SynFile} from "../../api/filesystem/SynFile";
import {SynNodeVisitor} from "../../utils/visitors/SynNodeVisitor";
import {SynTemplateFile} from "./SynTemplateFile";
import {SynModifiableFile} from "../../api/filesystem/SynModifiableFile";
import {ASTBuilder} from "../../builder/parser/builder/ASTBuilder";
import {TokenStream} from "../../builder/tokens/TokenStream";
import {EmptyKillSignal} from "../../../../utils/KillSignal";
import {SynCodeBlock} from "../../api/SynCodeBlock";
import {SourceRewriter} from "../SourceRewriter";
import {SynRecursiveVisitor} from "../../utils/visitors/SynRecursiveVisitor";
import {SynParentElement} from "../../api/tree/SynParentElement";

/**
 *
 * @author Atzitz Amos
 * @date 6/6/2026
 * @since 1.0.0
 */
export abstract class AbstractSynTemplate implements SynNode {
    private readonly root: SynCodeBlock;
    private readonly file: SynTemplateFile;
    private readonly replacement: Map<string, SynNode> = new Map();

    private parent: SynParentElement | null = null;

    public constructor(protected readonly template: string) {
        this.file = new SynTemplateFile();
        this.root = this.parse(this.createTokenStream(template), this.file);
    }

    getSynDocument(): SynFile {
        return this.file;
    }

    getChildren(): SynNode[] {
        return [this.root];
    }

    getRoot(): SynCodeBlock {
        return this.root;
    }

    getTextRange(): TextRange {
        return this.root.getTextRange();
    }

    getParent(): SynParentElement | null {
        return this.parent;
    }

    getText(): string {
        // We need to walk the tree and mark the ranges of the replaced nodes
        const ranges = new Map<string, TextRange>();
        new SynRecursiveVisitor(this.visitReplaceableNodes((node, name) => ranges.set(name, node.getTextRange()))).visitNode(this.root);

        const rewriter = new SourceRewriter(this.getLanguage().getPrinter());
        let text = this.template;
        for (const [placeholder, node] of this.replacement.entries()) {
            const range = ranges.get(placeholder);
            if (!range) {
                throw new Error(`Placeholder ${placeholder} not found in template`);
            }
            text = rewriter.replace(text, range, node);
        }
        return text;
    }

    nextSibling(): SynNode | null {
        if (!this.parent) return null;

        const siblings = this.parent.getChildren();
        const index = siblings.indexOf(this);
        if (index === -1 || index === siblings.length - 1) return null;

        return siblings[index + 1];
    }

    previousSibling(): SynNode | null {
        if (!this.parent) return null;

        const siblings = this.parent.getChildren();
        const index = siblings.indexOf(this);
        if (index <= 0) return null;

        return siblings[index - 1];
    }

    _setParent(parent: SynParentElement): void {
        this.parent = parent;
    }

    isSynElement<T extends SynNode>(this: T): this is SynASTElement {
        return false;
    }

    toDebugString(): string {
        return `(TEMPLATE ${this.root.toDebugString()})`;
    }

    toTreeRepr(): string {
        return this.constructor.name + " {\n" + this.root.toTreeRepr().split("\n").map(line => "  " + line).join("\n") + "\n}";
    }

    isSynthetic(): boolean {
        return true;
    }

    accept(visitor: SynNodeVisitor): void {
        visitor.visitTemplate(this);
    }

    getURI(): EditorURI {
        throw new Error("Method not implemented.");
    }

    public replace(placeholder: string, node: SynNode): void {
        if (!this.replacement.has(placeholder)) {
            this.replacement.set(placeholder, node);
        } else {
            throw new Error(`Placeholder ${placeholder} is already replaced`);
        }
    }

    public abstract getLanguage(): LanguageBase;

    protected createTokenStream(s: string): TokenStream {
        return this.getLanguage().createLexer().createTokenStream(s);
    }

    protected parse(stream: TokenStream, file: SynModifiableFile): SynCodeBlock {
        const builder = new ASTBuilder(stream, new EmptyKillSignal(), file);
        this.getLanguage().createParser(builder).parse();
        let children = builder.close().getChildren();
        if (children.length > 1 || !(children[0] instanceof SynCodeBlock)) {
            throw new Error("Template must contain exactly one code block as root element" +
                "If you want to allow multiple root elements, override the parse method and implement your own logic for handling the children of the root element");
        }
        return children[0];
    }

    protected abstract visitReplaceableNodes(callback: (node: SynNode, name: string) => void): SynNodeVisitor;
}
