import {ProjectDirectory} from "../../../../../core/project/filesystem/tree/ProjectDirectory";

/**
 *
 * @author Atzitz Amos
 * @date 11/11/2026
 * @since 1.0.0
 */
export class RefsDir {
    constructor(
        private readonly directory: ProjectDirectory,
        private readonly headsDir: ProjectDirectory,
        private readonly tagsDir: ProjectDirectory,
        private readonly remotesDir: ProjectDirectory | null
    ) {
    }
}
