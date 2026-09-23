import {ExtensionPoint} from "../../../../core/plugins/extensionPoints/ExtensionPoint";
import {FileSystemEntryType} from "./FileSystemEntryType";
import {LangRegistry} from "../../../../lang/LangRegistry";
import {FileSystemLanguageDefaultEntryType} from "./default/FileSystemLanguageDefaultEntryType";
import {FileSystemPlainFileEntryType} from "./default/FileSystemPlainFileEntryType";
import {FileSystemDirectoryEntryType} from "./default/FileSystemDirectoryEntryType";

/**
 *
 * @author Atzitz Amos
 * @date 9/12/2026
 * @since 1.0.0
 */
export class FileSystemEntryTypesRegistry {
    private static readonly fileSystemEntryTypesEP = new ExtensionPoint("projectFiles", FileSystemEntryType)
        .withDefaultContributors(new FileSystemPlainFileEntryType(), new FileSystemDirectoryEntryType());

    public static getAllFileSystemEntryTypes(): FileSystemEntryType[] {
        const languages = LangRegistry.getInstance().getSupportedLanguages();
        return this.fileSystemEntryTypesEP.getAll()
            .concat(languages.map(language => new FileSystemLanguageDefaultEntryType(language)));
    }
}
