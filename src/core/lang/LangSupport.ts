/*
 * Author: Atzitz Amos
 * Date: 10/10/2025
 */

import {LanguageBase} from "./LanguageBase";
import {FileTypeHandler} from "./FileTypeHandler";
import {WorkspaceFile} from "../workspace/filesystem/tree/WorkspaceFile";
import {InspectionBase} from "./inspections/Inspection";
import {InspectionEngine} from "./inspections/InspectionEngine";

export class LangSupport {
    private static instance: LangSupport;

    private languages: LanguageBase[] = [];
    private fileTypeHandlers: FileTypeHandler[] = [];

    private inspections: Map<string, InspectionBase[]> = new Map();

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

    registerInspection(inspection: InspectionBase) {
        const languages = inspection.getApplicableLanguages();
        for (const language of languages) {
            if (!this.inspections.has(language.getKey())) {
                this.inspections.set(language.getKey(), []);
            }
            this.inspections.get(language.getKey())!.push(inspection);
        }
    }

    suppressInspection(inspection: InspectionBase) {
        for (const [languageKey, inspections] of this.inspections.entries()) {
            const index = inspections.indexOf(inspection);
            if (index !== -1) {
                inspections.splice(index, 1);
                if (inspections.length === 0) {
                    this.inspections.delete(languageKey);
                }
            }
        }
    }

    getAllInspectionsForLanguage(language: LanguageBase): InspectionBase[] {
        return this.inspections.get(language.getKey()) || [];
    }

    getInspectionEngineForLanguage(language: LanguageBase) {
        return new InspectionEngine(this.getAllInspectionsForLanguage(language));
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

    getLanguageByKey(language: string) {
        return this.languages.find(lang => lang.getKey() === language) ?? null;
    }
}
