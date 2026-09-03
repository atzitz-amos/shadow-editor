import {URILocatedResource} from "../../../../core/uri/URILocatedResource";
import {EditorURI} from "../../../../core/uri/EditorURI";
import {TokenStream} from "../../builder/tokens/TokenStream";
import {ProblemsHolder} from "../../../codeAnalysis/inspections/problems/ProblemsHolder";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {ProjectFile} from "../../../../core/project/filesystem/tree/ProjectFile";
import {SynTree} from "../tree/SynTree";
import {LanguageBase} from "../../../LanguageBase";
import {SynFile} from "../filesystem/SynFile";
import {Document} from "../../../../editor/core/document/Document";
import {IndexFile} from "../../../indexes/IndexFile";
import {ASTCheckpoint} from "../../builder/parser/optimizer/recovery/ASTCheckpoint";

/**
 *
 * @author Atzitz Amos
 * @date 6/29/2026
 * @since 1.0.0
 */
export interface SynDocument extends URILocatedResource {
    getURI(): EditorURI;

    getSynFile(): SynFile | null;

    getAssociatedFile(): ProjectFile | null;

    getModificationTimestamp(): number;

    getText(): string;

    makeTokenStream(): TokenStream;

    markDirty(flag: boolean): void;

    isDirty(): boolean;

    commit(tree: SynTree, checkpoints: ASTCheckpoint[], timestamp: number): void;

    getCheckpoints(): ASTCheckpoint[] | null;

    getFullRange(): TextRange;

    getLanguage(): LanguageBase;

    getTree(): SynTree;

    getDocument(): Document;

    getProblemsHolder(): ProblemsHolder;

    getIndexFile(): IndexFile;
}
