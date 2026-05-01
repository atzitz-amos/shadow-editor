import {URILocatedResource} from "../uri/URILocatedResource";
import {EditorURI} from "../uri/EditorURI";
import {URITargetType} from "../uri/URITargetType";
import {WorkspaceFS} from "./filesystem/WorkspaceFS";
import {GlobalState} from "../global/GlobalState";
import {WorkspaceFileSystemLoadedEvent} from "./events/WorkspaceFileSystemLoadedEvent";

export class Workspace implements URILocatedResource {
    private readonly name: string;

    private fs: WorkspaceFS;

    constructor(name: string) {
        this.name = name;
        navigator.storage.getDirectory().then(async handle => {
            this.fs = new WorkspaceFS(name, handle);
            await this.fs.init();

            GlobalState.getMainEventBus().asyncPublish(new WorkspaceFileSystemLoadedEvent(this));
        });
    }

    public static emptyProject(name: string) {
        return new this(name);
    }

    getName(): string {
        return this.name;
    }

    getURI(): EditorURI {
        return new EditorURI(this.name, URITargetType.FILE);
    }

    getFS(): WorkspaceFS {
        return this.fs;
    }
}