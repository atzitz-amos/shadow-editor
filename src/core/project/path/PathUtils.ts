/**
 *
 * @author Atzitz Amos
 * @date 11/14/2025
 * @since 1.0.0
 */
export class PathUtils {
    public static normalizePath(path: string): string {
        // Replace backslashes with forward slashes
        let normalizedPath = path.replace(/\\/g, '/');

        // Remove redundant slashes
        normalizedPath = normalizedPath.replace(/\/+/g, '/');

        if (normalizedPath.startsWith("./")) {
            normalizedPath = normalizedPath.slice(1);
        } else if (normalizedPath === ".") {
            normalizedPath = "/";
        }

        // Remove trailing slash (if not root)
        if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
            normalizedPath = normalizedPath.slice(0, -1);
        }

        return normalizedPath;
    }

    public static isRelativePath(path: string) {
        return path.startsWith("/");
    }
}
