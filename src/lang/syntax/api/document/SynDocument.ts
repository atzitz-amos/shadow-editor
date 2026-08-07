import {URILocatedResource} from "../../../../core/uri/URILocatedResource";
import {EditorURI} from "../../../../core/uri/EditorURI";
import {TokenStream} from "../../builder/tokens/TokenStream";
import {ProblemsHolder} from "../../../codeAnalysis/inspections/problems/ProblemsHolder";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {WorkspaceFile} from "../../../../core/workspace/filesystem/tree/WorkspaceFile";
import {SynTree} from "../tree/SynTree";
import {LanguageBase} from "../../../LanguageBase";
import {SynFile} from "../filesystem/SynFile";
import {Document} from "../../../../editor/core/document/Document";

/**
 *
 * @author Atzitz Amos
 * @date 6/29/2026
 * @since 1.0.0
 */
export interface SynDocument extends URILocatedResource {
    getURI(): EditorURI;

    getText(): string;

    commit(tree: SynTree, timestamp: number): void;

    getModificationTimestamp(): number;

    getAssociatedFile(): WorkspaceFile | null;

    getSynFile(): SynFile | null;

    makeTokenStream(): TokenStream;

    markDirty(flag: boolean): void;

    isDirty(): boolean;

    getProblemsHolder(): ProblemsHolder;

    getFullRange(): TextRange;

    getTree(): SynTree;

    getLanguage(): LanguageBase;

    getDocument(): Document;
}
