import {Path} from "./Path";
import {PathUtils} from "./PathUtils";

/**
 *
 * @author Atzitz Amos
 * @date 11/14/2025
 * @since 1.0.0
 */
export class AbsolutePath extends Path {
    public constructor(path: string, virtual: boolean, isFilePath: boolean) {
        super(PathUtils.normalizePath(path), virtual, isFilePath);

        if (PathUtils.isRelativePath(this.path)) {
            throw new Error(`AbsolutePath constructor received a relative path: ${path}`);
        }
    }

    extendDir(name: string): Path {
        if (this.isFile()) {
            throw new Error(`Cannot extend file path "${this.path}" with a directory.`);
        }
        return new AbsolutePath(this.path + "/" + name, this.virtual, false);
    }

    extendFile(fileName: string): Path {
        return new AbsolutePath(this.path + "/" + fileName, this.virtual, true);
    }

    getParentPath(): Path {
        if (this.parts.length <= 1) {
            return this; // Root path has no parent
        }
        let parentParts = this.parts.slice(0, this.parts.length - 1);
        let parentPathStr = parentParts.join("/");
        return new AbsolutePath(parentPathStr, this.virtual, false);
    }

    toAbsolutePath(): Path {
        return this;
    }

    toRelativePath(): Path {
        throw new Error("Method not implemented."); // TODO
    }

}
