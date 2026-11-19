/**
 * Enumeration representing different targets for editor URIs within the application.
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export enum URITargetType {
    FILE = "project://",
    DOCUMENT = "document://",
    SYMBOL = "symbol://",
    SCOPE = "scope://",
    ERROR = "error://",
    EDITOR = "editor://",
}


export function URITargetFromString(targetString: string): URITargetType {
    switch (targetString) {
        case "project://":
            return URITargetType.FILE;
        case "symbol://":
            return URITargetType.SYMBOL;
        case "editor://":
            return URITargetType.EDITOR;
        case "scope://":
            return URITargetType.SCOPE;
        case "error://":
            return URITargetType.ERROR;
        case "document://":
            return URITargetType.DOCUMENT;
        default:
            throw new Error(`Unknown target type: ${targetString}`);
    }
}