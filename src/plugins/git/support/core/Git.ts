import {ProjectDirectory} from "../../../../core/project/filesystem/tree/ProjectDirectory";
import {Repository} from "../data/Repository";
import {GitLoader} from "./loader/GitLoader";

/**
 *
 * @author Atzitz Amos
 * @date 11/11/2026
 * @since 1.0.0
 */
export class Git {
    public static async init(root: ProjectDirectory, config: GitInitConfig = {}): Promise<Repository> {
        return await GitLoader.scaffold(root, config);
    }

    public static async open(root: ProjectDirectory): Promise<Repository | null> {
        if (!root.hasDirectory(".git"))
            return null;

        const gitDir = root.openDirectory(".git");
        return await GitLoader.tryLoad(root, gitDir);
    }
}
