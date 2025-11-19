import {VirtualFileSystem} from "./filesystem/VirtualFileSystem";
import {ExternalFileSystem} from "./filesystem/ExternalFileSystem";

export class Project {
    name: string;

    directoryHandle: FileSystemDirectoryHandle | null = null;

    constructor(name: string) {
        this.name = name;
    }

    public static emptyProject(name: string) {
        return new this(name);
    }

    public static openProject(name: string, directoryHandle: FileSystemDirectoryHandle) {
        const project = new this(name);
        project.overwriteFromDisk(directoryHandle);
        return project;
    }

    /**
     * Set the directory handle. **WARNING: THIS WILL OVERWRITE ALL FILES OF THE PROJECT IN THE VFS**
     *
     * This method is primarily used to first load a project into the VFS, all other usage
     * should rather use VirtualFileSystem.requestDiskUpdate()
     *
     * @see Project.overwriteToDisk
     * */
    public overwriteFromDisk(handle: FileSystemDirectoryHandle) {
        this.directoryHandle = handle;

        VirtualFileSystem.getInstance(this).overwriteFromDisk();
    }

    /**
     * Set the directory handle. **WARNING: THIS WILL OVERWRITE ALL FILES PRESENT IN THE DISK FOLDER**
     *
     * @see Project.overwriteFromDisk
     */
    public overwriteToDisk(handle: FileSystemDirectoryHandle) {
        this.directoryHandle = handle;

        ExternalFileSystem.getInstance(this).overwriteDiskContent();
    }
}