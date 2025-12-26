import {URILocatedResource} from "./uri/URILocatedResource";
import {EditorURI} from "./uri/EditorURI";
import {URITargetType} from "./uri/URITargetType";
import {ProjectFile} from "./filetree/ProjectFile";
import {Path} from "./path/Path";
import {RelativePath} from "./path/RelativePath";

export class Project implements URILocatedResource {
    private readonly name: string;

    private rootPath: Path;

    private directoryHandle: FileSystemDirectoryHandle | null = null;

    constructor(name: string) {
        this.name = name;

        this.rootPath = new RelativePath("/", true, false);
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

    createNewUntitledFile(): ProjectFile {
        return new ProjectFile(this, "<untitled>", this.rootPath);
    }
}