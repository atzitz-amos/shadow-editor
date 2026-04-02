/*
 * Author: Atzitz Amos
 * Date: 10/10/2025
 */

import {LanguageBase} from "./LanguageBase";
import {FileTypeHandler} from "./FileTypeHandler";
import {WorkspaceFile} from "../workspace/filesystem/tree/WorkspaceFile";

export class LangSupport {
    private static instance: LangSupport;

    private languages: LanguageBase[] = [];
    private fileTypeHandlers: FileTypeHandler[] = [];

    constructor() {
    }

    public static getInstance(): LangSupport {
        if (!this.instance) {
            this.instance = new LangSupport();
        }
        return this.instance;
    }

    registerLanguage(language: LanguageBase) {
        this.languages.push(language);
    }

    registerFileTypeHandler(handler: FileTypeHandler) {
        this.fileTypeHandlers.push(handler);
    }

    getSupportedLanguages(): LanguageBase[] {
        return this.languages;
    }

    getAllFileTypeHandlers(): FileTypeHandler[] {
        return this.fileTypeHandlers;
    }

    getFileTypeHandler(file: WorkspaceFile): FileTypeHandler | null {
        let bestHandler: FileTypeHandler | null = null;
        let bestSupportLevel = 0;
        for (const handler of this.fileTypeHandlers) {
            let supportLevel = handler.getSupportLevel(file);

            if (bestSupportLevel < supportLevel) {
                bestSupportLevel = supportLevel;
                bestHandler = handler;
            }
        }

        return bestHandler;
    }

    suppressFileTypeHandler(handler: FileTypeHandler) {
        const index = this.fileTypeHandlers.indexOf(handler);
        if (index !== -1) {
            this.fileTypeHandlers.splice(index, 1);
        }
    }

    getAssociatedLanguage(file: WorkspaceFile) {
        let handler = this.getFileTypeHandler(file);
        return handler ? handler.getLanguageForFile(file) : null;
    }
}
