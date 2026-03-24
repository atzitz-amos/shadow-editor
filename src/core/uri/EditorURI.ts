import {URITargetFromString, URITargetType} from "./URITargetType";
import {TextRange} from "../../editor/core/coordinate/TextRange";


/**
 * Represents a URI to any editor resource.
 * This includes files, folders, projects, settings, SynElements, etc...
 *
 * Syntax:
 * <pre><target>://<path/to/resource>#<anchor></pre>
 *
 * Targets:
 * - `project://` - Refers to a project resource. A file or a folder within a project.
 * - `symbol://` - Refers to a SynSymbol within a SynFile
 * - `editor://` - Refers to an editor's resource, such as settings or preferences.
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export class EditorURI {
    private readonly target: URITargetType;

    private readonly pathParts: string[];
    private readonly anchorParts: string[];

    constructor(uri: string, target?: URITargetType) {
        if (uri.indexOf("://") !== -1) {
            this.target = URITargetFromString(uri.substring(0, uri.indexOf("://") + 3));
            uri = uri.substring(uri.indexOf("://") + 3);
        } else {
            if (!target) {
                throw new Error("Target type must be specified if not included in URI.");
            }
            this.target = target;
        }
        if (uri.startsWith("/"))
            uri = uri.substring(1);

        if (uri.indexOf("#") !== -1) {
            this.pathParts = uri.substring(0, uri.indexOf("#")).split("/").filter(part => part.length > 0);
            this.anchorParts = uri.substring(uri.indexOf("#") + 1).split(".").filter(part => part.length > 0);
        } else {
            this.pathParts = uri.split("/").filter(part => part.length > 0);
            this.anchorParts = [];
        }
    }

    getURI(): string {
        return this.target + this.getLocator();
    }

    getLocator(): string {
        return this.getPath() + ((this.anchorParts.length > 0) ? ("#" + this.getAnchor()) : "");
    }

    getTarget(): URITargetType {
        return this.target;
    }

    getPathParts(): string[] {
        return this.pathParts;
    }

    getPath(): string {
        return this.pathParts.join("/");
    }

    getAnchorParts(): string[] {
        return this.anchorParts;
    }

    getAnchor(): string {
        return this.anchorParts.join(".");
    }

    /**
     * Return a new EditorURI that represents a TextRange inside the URI resource. Will overwrite the anchor
     * */
    selectedRegion(range: TextRange, newTarget?: URITargetType): EditorURI {
        return new EditorURI(this.getPath() + "#selected:" + range.start + "-" + range.end, newTarget ?? this.target);
    }

    toString(): string {
        return this.getURI();
    }

    extend(other: EditorURI): EditorURI;
    extend(other: string, target?: URITargetType): EditorURI;
    extend(other: EditorURI | string, target?: URITargetType): EditorURI {
        if (typeof other === "string") {
            other = new EditorURI(other, target ?? this.target);
        }
        let newURI = this.getPathParts().concat(other.getPathParts()).join("/");

        // If the other has an anchor, use it
        if (other.getAnchorParts().length > 0) {
            newURI += "#" + other.getAnchor();
        }

        return new EditorURI(newURI, other.target);
    }

    extendAnchor(part: string, target?: URITargetType): EditorURI {
        let uri = new EditorURI(this.getLocator(), target ?? this.target);
        uri.anchorParts.push(part);
        return uri;
    }
}
