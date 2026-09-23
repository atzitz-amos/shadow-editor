import {FileSystemEntryType} from "../FileSystemEntryType";
import {LanguageBase} from "../../../../../lang/LanguageBase";
import {ProjectFile} from "../../../../../core/project/filesystem/tree/ProjectFile";
import {Icon} from "../../../../../core/ui/icons/Icon";
import {ProjectDirectory} from "../../../../../core/project/filesystem/tree/ProjectDirectory";

/**
 *
 * @author Atzitz Amos
 * @date 9/12/2026
 * @since 1.0.0
 */
export class FileSystemLanguageDefaultEntryType extends FileSystemEntryType {
    constructor(private readonly language: LanguageBase) {
        super();
    }

    getDescription(): string {
        return this.language.getDisplayName() + " File";
    }

    getIcon(): Icon | null {
        return this.language.getIcon();
    }

    createEntry(parent: ProjectDirectory, name: string): ProjectFile {
        const extension = "." + this.language.getDefaultExtension();
        if (!name.endsWith(extension)) {
            name += extension;
        }

        return parent.createFile(name);
    }
}
