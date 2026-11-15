import {ProjectDirectory} from "../../../../../core/project/filesystem/tree/ProjectDirectory";
import {ProjectFile} from "../../../../../core/project/filesystem/tree/ProjectFile";
import {ObjectsDir} from "./ObjectsDir";
import {RefsDir} from "./RefsDir";

/**
 *
 * @author Atzitz Amos
 * @date 11/11/2026
 * @since 1.0.0
 */
export class GitDir {
    constructor(
        private readonly directory: ProjectDirectory,
        private readonly objectsDir: ObjectsDir,
        private readonly refsDir: RefsDir,
        private readonly headFile: ProjectFile,
        private readonly configFile: ProjectFile
    ) {

    }
}
