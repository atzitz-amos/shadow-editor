import {URILocatedResource} from "../../../../uri/URILocatedResource";
import {EditorURI} from "../../../../uri/EditorURI";
import {TokenStream} from "../../builder/tokens/TokenStream";
import {ProblemsHolder} from "../../../inspections/problems/ProblemsHolder";
import {TextRange} from "../../../../../editor/core/coordinate/range/TextRange";
import {WorkspaceFile} from "../../../../workspace/filesystem/tree/WorkspaceFile";
import {SynTree} from "../tree/SynTree";
import {LanguageBase} from "../../../LanguageBase";

/**
 *
 * @author Atzitz Amos
 * @date 6/29/2026
 * @since 1.0.0
 */
export interface SynDocument extends URILocatedResource {
    getURI(): EditorURI;

    getText(): string;

    getAssociatedFile(): WorkspaceFile | null;

    makeTokenStream(): TokenStream;

    getProblemsHolder(): ProblemsHolder;

    getFullRange(): TextRange;

    getTree(): SynTree;

    getLanguage(): LanguageBase;
}
