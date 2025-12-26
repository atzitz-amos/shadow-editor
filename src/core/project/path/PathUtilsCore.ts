import {AbsolutePath} from "./AbsolutePath";
import {PathUtils} from "./PathUtils";
import {RelativePath} from "./RelativePath";
import {Path} from "./Path";

/**
 *
 * @author Atzitz Amos
 * @date 11/18/2025
 * @since 1.0.0
 */
export class PathUtilsCore {
    /**
     * Create a joined path from a list of other paths.
     * Only the first path can be absolute. Other paths will be treated as relative to the previous path.
     * The result path will be absolute if the first path is absolute, otherwise it will be relative.
     *
     * Virtual paths can only be joined with other virtual paths. Consequently,
     * all paths must be either all virtual or non-virtual.
     *
     * If the first path is a string, it will be treated as a non-virtual absolute path.
     *
     * If the last path is a Path instance, its isFile property will be used for the resulting path.
     * */
    public static joinPaths(...paths: (Path | string)[]): Path {
        if (paths.length === 0) {
            throw new Error("No paths provided to join.");
        }

        const firstPath = paths[0];
        let isVirtual = false;
        let isAbsolute: boolean = true;
        let joinedPath = "";

        if (typeof firstPath === "string") {
            joinedPath = PathUtils.normalizePath(firstPath);
        } else {
            isVirtual = firstPath.isVirtual();
            joinedPath = PathUtils.normalizePath(firstPath.getAsString());
            isAbsolute = firstPath instanceof AbsolutePath;
        }
        for (let i = 1; i < paths.length; i++) {
            const currentPath = paths[i];
            let currentPathStr = "";
            if (typeof currentPath === "string") {
                currentPathStr = PathUtils.normalizePath(currentPath);
            } else {
                if (currentPath.isVirtual() !== isVirtual) {
                    throw new Error("Cannot join virtual and non-virtual paths.");
                }
                if (currentPath instanceof AbsolutePath) {
                    throw new Error("Only the first path can be absolute.");
                }
                currentPathStr = currentPath.getAsString();
            }
            if (!joinedPath.endsWith("/")) {
                joinedPath += "/";
            }
            while (currentPathStr.startsWith("/") || currentPathStr.startsWith(".")) {
                currentPathStr = currentPathStr.slice(1);
            }
            joinedPath += currentPathStr;
        }

        let isFile: boolean = paths[paths.length - 1] instanceof Path ? (paths[paths.length - 1] as Path).isFile() : false;

        if (isAbsolute) {
            return new AbsolutePath(joinedPath, isVirtual, isFile);
        }
        return new RelativePath(joinedPath, isVirtual, isFile);
    }

    public static createVirtualPath(path: string | Path, isFilePath: boolean) {
        return this.createPath(path, true, isFilePath);
    }

    public static createPhysicalPath(path: string | Path, isFilePath: boolean) {
        return this.createPath(path, false, isFilePath);
    }

    public static createPath(path: string | Path, isVirtual: boolean, isFilePath: boolean): Path {
        if (typeof path === "string") {
            const normalizedPath = PathUtils.normalizePath(path);
            if (PathUtils.isRelativePath(normalizedPath)) {
                return new RelativePath(normalizedPath, isVirtual, isFilePath);
            }
            return new AbsolutePath(normalizedPath, isVirtual, isFilePath);

        }

        if (path instanceof AbsolutePath) {
            return new AbsolutePath(path.getAsString(), true, isFilePath);
        } else {
            return new RelativePath(path.getAsString(), true, isFilePath);
        }
    }
}
