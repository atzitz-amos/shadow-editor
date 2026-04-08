import {URILocatedResource} from "../uri/URILocatedResource";
import {EditorURI} from "../uri/EditorURI";
import {URITargetType} from "../uri/URITargetType";
import {WorkspaceFS} from "./filesystem/WorkspaceFS";

export class Workspace implements URILocatedResource {
    private readonly name: string;

    private fs: WorkspaceFS;

    constructor(name: string) {
        this.name = name;
        navigator.storage.getDirectory().then(handle => {
            this.fs = new WorkspaceFS(name, handle);
        });
    }

    public static emptyProject(name: string) {
        return new this(name);
    }

    getName(): string {
        return this.name;
    }

    getURI(): EditorURI {
        return new EditorURI(this.name, URITargetType.PROJECT);
    }

    getFS(): WorkspaceFS {
        return this.fs;
    }
}