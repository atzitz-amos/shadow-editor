import {Path} from "./Path";
import {PathUtils} from "./PathUtils";

/**
 *
 * @author Atzitz Amos
 * @date 11/14/2025
 * @since 1.0.0
 */
export class RelativePath extends Path {
    public constructor(path: string, virtual: boolean, isFilePath: boolean) {
        super(PathUtils.normalizePath(path), virtual, isFilePath);

        if (!PathUtils.isRelativePath(this.path)) {
            throw new Error(`RelativePath constructor received an absolute path: ${path}`);
        }
    }

    extendFile(fileName: string): Path {
        return new RelativePath(this.path + "/" + fileName, this.virtual, true);
    }

    extendDir(name: string): Path {
        if (this.isFile()) {
            throw new Error(`Cannot extend file path "${this.path}" with a directory.`);
        }
        return new RelativePath(this.path + "/" + name, this.virtual, false);
    }

    getParentPath(): Path {
        if (this.parts.length <= 1) {
            return this; // Root path has no parent
        }
        let parentParts = this.parts.slice(0, this.parts.length - 1);
        let parentPathStr = parentParts.join("/");
        return new RelativePath(parentPathStr, this.virtual, false);
    }

    toAbsolutePath(): Path {
        return this; // TODO
    }

    toRelativePath(): Path {
        return this;
    }
}
