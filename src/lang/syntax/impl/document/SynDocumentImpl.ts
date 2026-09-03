import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {EditorURI} from "../../../../core/uri/EditorURI";
import {ProjectFile} from "../../../../core/project/filesystem/tree/ProjectFile";
import {ProblemsHolder} from "../../../codeAnalysis/inspections/problems/ProblemsHolder";
import {SynDocument} from "../../api/document/SynDocument";
import {TokenStream} from "../../builder/tokens/TokenStream";
import {Document} from "../../../../editor/core/document/Document";
import {SynTree} from "../../api/tree/SynTree";
import {LanguageBase} from "../../../LanguageBase";
import {SynFile} from "../../api/filesystem/SynFile";
import {IndexFile} from "../../../indexes/IndexFile";
import {DocumentLevelIndexFile} from "../../../indexes/impl/DocumentLevelIndexFile";
import {ASTCheckpoint} from "../../builder/parser/optimizer/recovery/ASTCheckpoint";
import {GlobalState} from "../../../../core/global/GlobalState";
import {SynTreeChangedEvent} from "../../../../editor/core/lang/events/SynTreeChangedEvent";

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
    private checkpoints: ASTCheckpoint[] | null = null;
    private indexFile: DocumentLevelIndexFile;

    private readonly language: LanguageBase;
    private readonly problemsHolder: ProblemsHolder;

    constructor(private readonly document: Document, private readonly synFile: SynFile | null) {
        this.id = SynDocumentImpl.DOCUMENT_ID++;

        this.language = document.getLanguage()!;
        this.problemsHolder = new ProblemsHolder(this);
    }

    isDirty(): boolean {
        return this.dirty;
    }

    markDirty(flag: boolean): void {
        this.dirty = flag;
    }

    commit(synTree: SynTree, checkpoints: ASTCheckpoint[], timestamp: number) {
        this.tree = synTree;
        this.checkpoints = checkpoints;
        if (this.indexFile) this.indexFile.override(synTree);
        else this.indexFile = new DocumentLevelIndexFile(this.tree.getGlobalScope());
        this.modificationTimestamp = timestamp;

        GlobalState.getMainEventBus().syncPublish(new SynTreeChangedEvent(this, this.language));
    }

    getCheckpoints(): ASTCheckpoint[] | null {
        return this.checkpoints;
    }

    getAssociatedFile(): ProjectFile | null {
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

    getIndexFile(): IndexFile {
        return this.indexFile;
    }
}
