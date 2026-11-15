import {ProjectDirectory} from "../../../../../core/project/filesystem/tree/ProjectDirectory";
import {Repository} from "../../data/Repository";
import {GitDir} from "../../data/dir/GitDir";
import {ObjectsDir} from "../../data/dir/ObjectsDir";
import {RefsDir} from "../../data/dir/RefsDir";
import {ConfigFile} from "../config/ConfigFile";

/**
 *
 * @author Atzitz Amos
 * @date 11/11/2026
 * @since 1.0.0
 */
export class GitLoader {
    public static async scaffold(root: ProjectDirectory, config: GitInitConfig): Promise<Repository> {
        const gitDir = this.getOrCreate(root, ".git");
        const objectsDir = this.getOrCreate(gitDir, "objects");
        const packDir = this.getOrCreate(objectsDir, "pack");
        const infoDir = this.getOrCreate(objectsDir, "info");
        const refsDir = this.getOrCreate(gitDir, "refs");
        const headsDir = this.getOrCreate(refsDir, "heads");
        const tagsDir = this.getOrCreate(refsDir, "tags");

        const configFile = await this.tryLoadConfig(gitDir);


        const headFile = gitDir.createFile("HEAD");
        await headFile.save(`ref: refs/heads/${config.initialBranch || "master"}\n`);

        return new Repository(root, new GitDir(
            gitDir,
            new ObjectsDir(objectsDir, packDir, infoDir),
            new RefsDir(refsDir, headsDir, tagsDir, null),
            headFile,
            configFile
        ));
    }

    public static async tryLoad(root: ProjectDirectory, gitDir: ProjectDirectory): Promise<Repository | null> {
        try {
            return new Repository(root, new GitDir(
                gitDir,
                this.tryLoadObjects(gitDir),
                await this.tryLoadRefs(gitDir),
                await this.tryLoadHead(gitDir),
                await this.tryLoadConfig(gitDir)
            ));
        } catch (e) {
            return null;
        }
    }

    private static tryLoadObjects(gitDir: ProjectDirectory) {
        const objectsDir = gitDir.openDirectory("objects");
        const packDir = objectsDir.openDirectory("pack");
        const infoDir = objectsDir.openDirectory("info");

        return new ObjectsDir(objectsDir, packDir, infoDir);
    }

    private static async tryLoadConfig(gitDir: ProjectDirectory) {
        if (gitDir.hasFile("config")) {
            return gitDir.openFile("config");
        }

        const file = gitDir.createFile("config");
        await file.save(ConfigFile.default().toString());
        return file;
    }

    private static async tryLoadRefs(gitDir: ProjectDirectory) {
        const refsDir = this.getOrCreate(gitDir, "refs");
        const headsDir = this.getOrCreate(refsDir, "heads");
        const tagsDir = this.getOrCreate(refsDir, "tags");
        const remotesDir = this.getOrNull(refsDir, "remotes");

        return new RefsDir(refsDir, headsDir, tagsDir, remotesDir);
    }

    private static getOrCreate(parent: ProjectDirectory, path: string) {
        if (parent.hasDirectory(path)) {
            return parent.openDirectory(path);
        } else {
            return parent.createDir(path);
        }
    }

    private static getOrNull(parent: ProjectDirectory, path: string) {
        if (parent.hasDirectory(path)) {
            return parent.openDirectory(path);
        } else {
            return null;
        }
    }

    private static async tryLoadHead(gitDir: ProjectDirectory) {
        return gitDir.openFile("HEAD");
    }
}
