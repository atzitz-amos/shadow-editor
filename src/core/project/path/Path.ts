import {EditorURI} from "../uri/EditorURI";
import {URITargetType} from "../uri/URITargetType";

/**
 * Represents a file system path within the project.
 * It can be either virtual or physical.
 *
 * @author Atzitz Amos
 * @date 11/14/2025
 * @since 1.0.0
 */
export abstract class Path {
    protected readonly path: string;
    protected readonly parts: string[];

    protected constructor(path: string, protected virtual: boolean, protected isFilePath: boolean) {
        this.path = path;
        this.parts = this.path.split("/").filter(x => x.length > 0);
    }


    isVirtual(): boolean {
        return this.virtual;
    }

    getAsString(): string {
        return this.path;
    }

    isFile(): boolean {
        return this.isFilePath;
    }

    isDirectory(): boolean {
        return !this.isFilePath;
    }

    getFileName(): string | null {
        if (this.isFile())
            return this.parts[this.parts.length - 1];
        return null;
    }


    getExtension(): string | null {
        let fileName = this.getFileName();
        if (fileName) {
            let dotIndex = fileName.lastIndexOf(".");
            if (dotIndex !== -1 && dotIndex !== fileName.length - 1) {
                return fileName.substring(dotIndex + 1);
            }
            return "";
        }
        return null;
    }

    getSegments(): string[] {
        return this.parts;
    }

    asURI() {
        return new EditorURI(this.path, URITargetType.PROJECT);
    }

    abstract extendFile(fileName: string): Path;

    abstract extendDir(name: string): Path;

    abstract getParentPath(): Path;

    abstract toAbsolutePath(): Path;

    abstract toRelativePath(): Path;
}