import {URILocatedResource} from "../uri/URILocatedResource";
import {EditorURI} from "../uri/EditorURI";
import {URITargetType} from "../uri/URITargetType";
import {GlobalState} from "../global/GlobalState";
import {ProjectFileSystemLoadedEvent} from "./events/ProjectFileSystemLoadedEvent";
import {Serializable, SerializableType} from "../persistence/serializable/Serializable";
import {FileSystem} from "./filesystem/FileSystem";
import {ProjectVFS} from "./filesystem/ProjectVFS";

export class Project implements URILocatedResource, Serializable {
    private readonly name: string;

    private fs: FileSystem;

    constructor(name: string) {
        this.name = name;
        navigator.storage.getDirectory().then(async handle => {
            this.fs = new ProjectVFS(name, await handle.getDirectoryHandle(name, {create: true}));
            await this.fs.init();

            GlobalState.getMainEventBus().asyncPublish(new ProjectFileSystemLoadedEvent(this));
        });
    }

    public static emptyProject(name: string) {
        return new this(name);
    }

    public static deserializer(data: { name: string }): Project {
        return new Project(data.name);
    }

    getName(): string {
        return this.name;
    }

    getURI(): EditorURI {
        return new EditorURI(this.name, URITargetType.FILE);
    }

    getFS(): FileSystem {
        return this.fs;
    }

    serialize(): SerializableType {
        return {"name": this.name};
    }
}