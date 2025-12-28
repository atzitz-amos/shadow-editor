import {FileSystem} from "./FileSystem";
import {Project} from "../Project";
import {GlobalState} from "../../global/GlobalState";
import {Directory} from "../filetree/Directory";
import {FileTreeEntry} from "../filetree/FileTreeEntry";
import {ProjectFile} from "../filetree/ProjectFile";

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

    getRootDirectory(): Directory {
        throw new Error("Method not implemented.");
    }

    getDirectory(path: string): Directory {
        throw new Error("Method not implemented.");
    }

    getFile(path: string): ProjectFile {
        throw new Error("Method not implemented.");
    }

    readFile(path: string): string {
        throw new Error("Method not implemented.");
    }

    writeFile(file: ProjectFile, content: string): void {
        throw new Error("Method not implemented.");
    }

    createFile(parent: Directory | null, name: string, content: string): ProjectFile {
        throw new Error("Method not implemented.");
    }

    deleteFile(file: ProjectFile): void {
        throw new Error("Method not implemented.");
    }

    fileExists(path: string): boolean {
        throw new Error("Method not implemented.");
    }

    createDirectory(parent: Directory | null, name: string): Directory {
        throw new Error("Method not implemented.");
    }

    directoryExists(path: string): boolean {
        throw new Error("Method not implemented.");
    }

    deleteDirectory(dir: Directory): void {
        throw new Error("Method not implemented.");
    }

    getDirectoryContents(path: string): FileTreeEntry[] {
        throw new Error("Method not implemented.");
    }

    overwriteDiskContent() {

    }
}
