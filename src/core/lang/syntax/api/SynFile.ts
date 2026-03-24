import {SynNode} from "./SynNode";
import {ProjectFile} from "../../../workspace/filetree/ProjectFile";
import {Path} from "../../../workspace/filesystem/path/Path";
import {URILocatedResource} from "../../../uri/URILocatedResource";

/**
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export interface SynFile extends SynNode, URILocatedResource {
    getProjectFile(): ProjectFile;

    getPath(): Path;
}
