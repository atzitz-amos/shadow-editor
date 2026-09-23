import {ProjectFile} from "../../../core/project/filesystem/tree/ProjectFile";
import {FileTypeProvider, SupportLevel} from "../../../lang/FileTypeProvider";
import {LanguageBase} from "../../../lang/LanguageBase";
import HTMLLang from "./HTMLLang";

/**
 *
 * @author Atzitz Amos
 * @date 9/17/2026
 * @since 1.0.0
 */
export default class HTMLFileTypeProvider extends FileTypeProvider {
    public getSupportLevel(file: ProjectFile): SupportLevel {
        if (file.getExtension() === "html") return SupportLevel.SUPPORTS;
        return SupportLevel.DOESNT;
    }

    public getLanguageForFile(file: ProjectFile): LanguageBase | null {
        return HTMLLang.INSTANCE;
    }

}
