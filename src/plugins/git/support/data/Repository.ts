import {ProjectDirectory} from "../../../../core/project/filesystem/tree/ProjectDirectory";
import {GitDir} from "./dir/GitDir";

/**
 *
 * @author Atzitz Amos
 * @date 11/11/2026
 * @since 1.0.0
 */
export class Repository {

    constructor(private readonly root: ProjectDirectory, private readonly gitDir: GitDir) {

    }
}
