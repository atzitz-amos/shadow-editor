import {VirtualFileSystem} from "./filesystem/VirtualFileSystem";
import {PersistenceStrategy} from "../persistence/PersistenceStrategy";

export class Project {
    name: string;

    directoryHandle: FileSystemDirectoryHandle | null = null;

    constructor(name: string) {
        this.name = name;
    }

    public static emptyProject(name: string) {
        return new this(name);
    }

    public static openProject(name: string, strategy: PersistenceStrategy = PersistenceStrategy.PERSIST) {
        const project = new this(name);
        VirtualFileSystem.load(this, strategy);
        return project;
    }
}