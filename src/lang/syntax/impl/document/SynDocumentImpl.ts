import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {EditorURI} from "../../../../core/uri/EditorURI";
import {WorkspaceFile} from "../../../../core/workspace/filesystem/tree/WorkspaceFile";
import {ProblemsHolder} from "../../../codeAnalysis/inspections/problems/ProblemsHolder";
import {SynDocument} from "../../api/document/SynDocument";
import {TokenStream} from "../../builder/tokens/TokenStream";
import {Document} from "../../../../editor/core/document/Document";
import {SynTree} from "../../api/tree/SynTree";
import {LanguageBase} from "../../../LanguageBase";
import {SynTreeImpl} from "../tree/SynTreeImpl";
import {SynFile} from "../../api/filesystem/SynFile";

/**
 *
 * @author Atzitz Amos
 * @date 7/1/2026
 * @since 1.0.0
 */
export class SynDocumentImpl implements SynDocument {
    private static DOCUMENT_ID = 0;
    private readonly id: number;

    private modificationTimestamp: number = 0;

    private dirty: boolean = true;
    private tree: SynTree;

    private readonly language: LanguageBase;
    private readonly problemsHolder: ProblemsHolder;

    constructor(private readonly document: Document, private readonly synFile: SynFile | null) {
        this.id = SynDocumentImpl.DOCUMENT_ID++;

        this.problemsHolder = new ProblemsHolder(this);

        this.language = document.getLanguage()!;
        this.tree = new SynTreeImpl(this.language, [], this);
    }

    isDirty(): boolean {
        return this.dirty;
    }

    markDirty(flag: boolean): void {
        this.dirty = flag;
    }

    commit(synTree: SynTree, timestamp: number) {
        this.tree = synTree;
        this.modificationTimestamp = timestamp;
    }

    getAssociatedFile(): WorkspaceFile | null {
        return this.document.getAssociatedFile();
    }

    getSynFile(): SynFile | null {
        return this.synFile;
    }

    getModificationTimestamp(): number {
        return this.modificationTimestamp;
    }

    getURI(): EditorURI {
        return this.getAssociatedFile() ? this.getAssociatedFile()!.getURI() : new EditorURI("document://temp/" + this.id);
    }

    getText(): string {
        return this.document.getTextContent();
    }

    getDocument(): Document {
        return this.document;
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
