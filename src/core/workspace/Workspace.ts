import {URILocatedResource} from "../uri/URILocatedResource";
import {EditorURI} from "../uri/EditorURI";
import {URITargetType} from "../uri/URITargetType";
import {WorkspaceFS} from "./filesystem/WorkspaceFS";

export class Workspace implements URILocatedResource {
    private readonly name: string;

    constructor(name: string) {
        this.name = name;

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

    }
}