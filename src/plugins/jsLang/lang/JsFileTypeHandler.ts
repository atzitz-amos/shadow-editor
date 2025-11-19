/*
 * Author: Atzitz Amos
 * Date: 10/5/2025
 */

import {ProjectFile} from "../../../core/project/filetree/ProjectFile";
import {FileTypeHandler, SupportLevel} from "../../../core/lang/FileTypeHandler";
import JsLang from "./JsLang";
import {LanguageBase} from "../../../core/lang/LanguageBase";

export default class JsFileTypeHandler extends FileTypeHandler {
    public getSupportLevel(file: ProjectFile): SupportLevel {
        if (file.getExtension() === "js") return SupportLevel.SUPPORTS;
        return SupportLevel.DOESNT;
    }

    public getLanguageForFile(file: ProjectFile): LanguageBase | null {
        return JsLang.class;
    }
}
