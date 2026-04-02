import {SynNode} from "./SynNode";
import {URILocatedResource} from "../../../uri/URILocatedResource";
import {RelativePath} from "../../../workspace/filesystem/path/RelativePath";
import {WorkspaceFile} from "../../../workspace/filesystem/tree/WorkspaceFile";

/**
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export interface SynFile extends SynNode, URILocatedResource {
    getWorkspaceFile(): WorkspaceFile;

    getPath(): RelativePath;
}
