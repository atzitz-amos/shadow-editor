import {FileSystemEntry} from "../../../../../core/project/filesystem/tree/FileSystemEntry";
import {ProjectDirectory} from "../../../../../core/project/filesystem/tree/ProjectDirectory";
import {Icon} from "../../../../../core/ui/icons/Icon";
import {FileSystemEntryType} from "../FileSystemEntryType";
import {FaIcon} from "../../../../../core/ui/icons/FaIcon";

/**
 *
 * @author Atzitz Amos
 * @date 9/12/2026
 * @since 1.0.0
 */
export class FileSystemPlainFileEntryType extends FileSystemEntryType {
    getDescription(): string {
        return "Plain Text";
    }

    getIcon(): Icon | null {
        return FaIcon.solid("align-left");
    }

    createEntry(parent: ProjectDirectory, name: string): FileSystemEntry {
        return parent.createFile(name);
    }

}
