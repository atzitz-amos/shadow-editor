import {VirtualFile} from "../../filetree/VirtualFile";

/**
 *
 * @author Atzitz Amos
 * @date 11/19/2025
 * @since 1.0.0
 */
export class VirtualFileOutdatedError extends Error {
    constructor(file: VirtualFile) {
        super(`Virtual file "${file.getPath().getFileName()}" outdated.`);
    }
}
