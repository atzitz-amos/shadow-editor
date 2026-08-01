import {URILocatedResource} from "../../../../uri/URILocatedResource";
import {RelativePath} from "../../../../workspace/filesystem/path/RelativePath";
import {WorkspaceFile} from "../../../../workspace/filesystem/tree/WorkspaceFile";
import {SynDocument} from "../document/SynDocument";

/**
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export interface SynFile extends URILocatedResource {
    getWorkspaceFile(): WorkspaceFile | null;

    getPath(): RelativePath | null;

    getSynDocument(): SynDocument;
}
