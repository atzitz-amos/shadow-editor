import {TextRange} from "../../../../../editor/core/coordinate/range/TextRange";
import {EditorURI} from "../../../../uri/EditorURI";
import {WorkspaceFile} from "../../../../workspace/filesystem/tree/WorkspaceFile";
import {ProblemsHolder} from "../../../inspections/problems/ProblemsHolder";
import {SynDocument} from "../../api/document/SynDocument";
import {TokenStream} from "../../builder/tokens/TokenStream";
import {Document} from "../../../../../editor/core/document/Document";
import {SynTree} from "../../api/tree/SynTree";
import {LanguageBase} from "../../../LanguageBase";
import {SynTreeImpl} from "../tree/SynTreeImpl";

/**
 *
 * @author Atzitz Amos
 * @date 7/1/2026
 * @since 1.0.0
 */
export class SynDocumentImpl implements SynDocument {
    private static DOCUMENT_ID = 0;
    private readonly id: number;
    private readonly problemsHolder: ProblemsHolder;
    private readonly language: LanguageBase;
    private tree: SynTree;

    constructor(private readonly document: Document) {
        this.id = SynDocumentImpl.DOCUMENT_ID++;

        this.problemsHolder = new ProblemsHolder(this);

        this.language = document.getLanguage()!;
        this.tree = new SynTreeImpl(this.language, [], this);
    }

    setTree(synTree: SynTree) {
        this.tree = synTree;
    }

    getAssociatedFile(): WorkspaceFile | null {
        return this.document.getAssociatedFile();
    }

    getURI(): EditorURI {
        return this.getAssociatedFile() ? this.getAssociatedFile()!.getURI() : new EditorURI("document://temp/" + this.id);
    }

    getText(): string {
        return this.document.getTextContent();
    }

    makeTokenStream(): TokenStream {
        return this.document.getTokenCache().createTokenStream();
    }

    getProblemsHolder(): ProblemsHolder {
        return this.problemsHolder;
    }

    getFullRange(): TextRange {
        return this.document.getFullRange();
    }

    getTree(): SynTree {
        return this.tree;
    }

    getLanguage(): LanguageBase {
        return this.language;
    }
}
