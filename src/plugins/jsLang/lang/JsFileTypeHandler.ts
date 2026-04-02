/*
 * Author: Atzitz Amos
 * Date: 10/5/2025
 */

import {FileTypeHandler, SupportLevel} from "../../../core/lang/FileTypeHandler";
import JsLang from "./JsLang";
import {LanguageBase} from "../../../core/lang/LanguageBase";
import {WorkspaceFile} from "../../../core/workspace/filesystem/tree/WorkspaceFile";

export default class JsFileTypeHandler extends FileTypeHandler {
    public getSupportLevel(file: WorkspaceFile): SupportLevel {
        if (file.getExtension() === "js") return SupportLevel.SUPPORTS;
        return SupportLevel.DOESNT;
    }

    public getLanguageForFile(file: WorkspaceFile): LanguageBase | null {
        return JsLang.class;
    }
}
