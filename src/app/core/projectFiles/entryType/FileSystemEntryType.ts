import {Icon} from "../../../../core/ui/icons/Icon";
import {ProjectDirectory} from "../../../../core/project/filesystem/tree/ProjectDirectory";
import {FileSystemEntry} from "../../../../core/project/filesystem/tree/FileSystemEntry";

/**
 *
 * @author Atzitz Amos
 * @date 9/12/2026
 * @since 1.0.0
 */
export abstract class FileSystemEntryType {
    abstract getDescription(): string;

    abstract getIcon(): Icon | null;

    abstract createEntry(parent: ProjectDirectory, name: string): FileSystemEntry;
}
