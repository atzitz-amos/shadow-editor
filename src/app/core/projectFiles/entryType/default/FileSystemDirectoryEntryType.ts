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
export class FileSystemDirectoryEntryType extends FileSystemEntryType {
    getDescription(): string {
        return "Directory";
    }

    getIcon(): Icon | null {
        return FaIcon.faFolder()
            .colored("#646464");
    }

    createEntry(parent: ProjectDirectory, name: string): FileSystemEntry {
        return parent.createDir(name);
    }

}
