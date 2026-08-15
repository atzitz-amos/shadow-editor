import {URILocatedResource} from "../../../../core/uri/URILocatedResource";
import {RelativePath} from "../../../../core/project/filesystem/path/RelativePath";
import {ProjectFile} from "../../../../core/project/filesystem/tree/ProjectFile";
import {SynDocument} from "../document/SynDocument";

/**
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export interface SynFile extends URILocatedResource {
    getProjectFile(): ProjectFile | null;

    getPath(): RelativePath | null;

    getSynDocument(): SynDocument;
}
