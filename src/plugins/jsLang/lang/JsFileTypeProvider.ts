/*
 * Author: Atzitz Amos
 * Date: 10/5/2025
 */

import {FileTypeProvider, SupportLevel} from "../../../lang/FileTypeProvider";
import JsLang from "./JsLang";
import {LanguageBase} from "../../../lang/LanguageBase";
import {ProjectFile} from "../../../core/project/filesystem/tree/ProjectFile";

export default class JsFileTypeProvider extends FileTypeProvider {
    public getSupportLevel(file: ProjectFile): SupportLevel {
        if (file.getExtension() === "js") return SupportLevel.SUPPORTS;
        return SupportLevel.DOESNT;
    }

    public getLanguageForFile(file: ProjectFile): LanguageBase | null {
        return JsLang.INSTANCE;
    }
}
