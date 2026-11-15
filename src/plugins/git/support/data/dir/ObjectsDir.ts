import {ProjectDirectory} from "../../../../../core/project/filesystem/tree/ProjectDirectory";


/**
 *
 * @author Atzitz Amos
 * @date 11/11/2026
 * @since 1.0.0
 */
export class ObjectsDir {
    constructor(
        private readonly directory: ProjectDirectory,
        private readonly packDir: ProjectDirectory,
        private readonly infoDir: ProjectDirectory
    ) {
    }

}
