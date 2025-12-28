import {VirtualFileSystem} from "../filesystem/VirtualFileSystem";
import {ProjectFile} from "./ProjectFile";
import {VirtualFileOutdatedError} from "../filesystem/error/VirtualFileOutdatedError";

/**
 *
 * @author Atzitz Amos
 * @date 11/14/2025
 * @since 1.0.0
 */
export class VirtualFile {
    private contentBuffer: string;
    private originalContent: string;

    constructor(private file: ProjectFile) {
        this.contentBuffer = file.getContent();
        this.originalContent = this.contentBuffer;
    }

    getPath() {
        return this.file.getPath();
    }

    getFile(): ProjectFile {
        return this.file;
    }

    writeContent(content: string): void {
        if (this.originalContent !== this.file.getContent()) {
            throw new VirtualFileOutdatedError(this);
        }
        this.contentBuffer = content;
    }

    appendContent(content: string): void {
        this.contentBuffer += content;
    }

    getContent(): string {
        return this.contentBuffer;
    }

    getOriginal(): string {
        return this.originalContent;
    }

    commit(): void {
        VirtualFileSystem.getInstance().commitFile(this);
    }
}