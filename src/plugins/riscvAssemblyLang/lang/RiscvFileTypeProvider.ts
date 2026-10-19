import {ProjectFile} from "../../../core/project/filesystem/tree/ProjectFile";
import {FileTypeProvider, SupportLevel} from "../../../lang/FileTypeProvider";
import {LanguageBase} from "../../../lang/LanguageBase";
import RiscvLang from "./RiscvLang";

/**
 *
 * @author Atzitz Amos
 * @date 10/6/2026
 * @since 1.0.0
 */
export default class RiscvFileTypeProvider extends FileTypeProvider {
    public getSupportLevel(file: ProjectFile): SupportLevel {
        if (file.getExtension() === "s") return SupportLevel.SUPPORTS;
        return SupportLevel.DOESNT;
    }

    public getLanguageForFile(file: ProjectFile): LanguageBase | null {
        return RiscvLang.INSTANCE;
    }

}
