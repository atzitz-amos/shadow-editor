import {FileSystem} from "./FileSystem";
import {Project} from "../Project";
import {GlobalState} from "../../global/GlobalState";

/**
 *
 * @author Atzitz Amos
 * @date 11/14/2025
 * @since 1.0.0
 */
export class ExternalFileSystem implements FileSystem {
    private static instances: Map<Project, ExternalFileSystem> = new Map();

    private lastDiskWriteTimestamp: number = 0;

    constructor(private project: Project) {
    }

    public static getInstance(project?: Project): ExternalFileSystem {
        if (!project) project = GlobalState.getProject();
        if (!this.instances.has(project)) {
            this.instances.set(project, new ExternalFileSystem(project));
        }
        return this.instances.get(project)!;
    }

    overwriteDiskContent() {

    }
}
