/*
 * Author: Atzitz Amos
 * Date: 10/10/2025
 */

import {LanguageBase} from "./LanguageBase";
import {FileTypeHandler} from "./FileTypeHandler";
import {WorkspaceFile} from "../workspace/filesystem/tree/WorkspaceFile";
import {InspectionBase} from "./inspections/Inspection";
import {InspectionEngine} from "./inspections/InspectionEngine";
import {ExtensionPoint} from "../plugins/extensionPoints/ExtensionPoint";
import {SmartInlineInsertAction} from "./smart/insert/SmartInlineInsertAction";
import {SmartInlineDeleteAction} from "./smart/delete/SmartInlineDeleteAction";
import {SmartInlineHighlight} from "./smart/highlight/SmartInlineHighlight";
import {TokenHoverAction} from "./tokenhover/TokenHoverAction";

export class LangSupport {
    private static instance: LangSupport;

    private static readonly languageEP: ExtensionPoint<LanguageBase> = new ExtensionPoint("lang", LanguageBase);
    private static readonly fileTypeEP: ExtensionPoint<FileTypeHandler> = new ExtensionPoint("lang", FileTypeHandler);
    private static readonly inspectionEP: ExtensionPoint<InspectionBase> = new ExtensionPoint("inspections", InspectionBase);

    private static readonly smartInsertEP: ExtensionPoint<SmartInlineInsertAction> = new ExtensionPoint("smart", SmartInlineInsertAction);
    private static readonly smartDeleteEP: ExtensionPoint<SmartInlineDeleteAction> = new ExtensionPoint("smart", SmartInlineDeleteAction);
    private static readonly smartHighlightEP: ExtensionPoint<SmartInlineHighlight> = new ExtensionPoint("smart", SmartInlineHighlight);

    private static readonly tokenHoverEP: ExtensionPoint<TokenHoverAction> = new ExtensionPoint("tokenhover", TokenHoverAction);

    constructor() {
    }

    public static getInstance(): LangSupport {
        if (!this.instance) {
            this.instance = new LangSupport();
        }
        return this.instance;
    }

    static definingPlugin(cls: LanguageBase | FileTypeHandler | InspectionBase): string | undefined {
        if (cls instanceof LanguageBase) {
            return this.languageEP.definingPlugin(cls)?.getId();
        } else if (cls instanceof FileTypeHandler) {
            return this.fileTypeEP.definingPlugin(cls)?.getId();
        } else if (cls instanceof InspectionBase) {
            return this.inspectionEP.definingPlugin(cls)?.getId();
        }
    }

    getAllInspectionsForLanguage(language: LanguageBase): InspectionBase[] {
        return LangSupport.inspectionEP.getAll().filter(inspection => inspection.getApplicableLanguages().includes(language));
    }

    getInspectionEngineForLanguage(language: LanguageBase) {
        return new InspectionEngine(this.getAllInspectionsForLanguage(language));
    }

    getSupportedLanguages(): LanguageBase[] {
        return LangSupport.languageEP.getAll();
    }

    getAllFileTypeHandlers(): FileTypeHandler[] {
        return LangSupport.fileTypeEP.getAll();
    }

    getAllSmartInsertActions(language: LanguageBase): SmartInlineInsertAction[] {
        return LangSupport.smartInsertEP.getAll().filter(action => action.getApplicableLanguages().includes(language));
    }

    getAllSmartDeleteActions(language: LanguageBase): SmartInlineDeleteAction[] {
        return LangSupport.smartDeleteEP.getAll().filter(action => action.getApplicableLanguages().includes(language));
    }

    getAllSmartHighlights(language: LanguageBase): SmartInlineHighlight[] {
        return LangSupport.smartHighlightEP.getAll().filter(action => action.getApplicableLanguages().includes(language));
    }

    getAllTokenHoverActions(language: LanguageBase): TokenHoverAction[] {
        return LangSupport.tokenHoverEP.getAll().filter(action => action.getApplicableLanguages().includes(language));
    }

    getFileTypeHandler(file: WorkspaceFile): FileTypeHandler | null {
        let bestHandler: FileTypeHandler | null = null;
        let bestSupportLevel = 0;
        for (const handler of this.getAllFileTypeHandlers()) {
            let supportLevel = handler.getSupportLevel(file);

            if (bestSupportLevel < supportLevel) {
                bestSupportLevel = supportLevel;
                bestHandler = handler;
            }
        }

        return bestHandler;
    }

    getAssociatedLanguage(file: WorkspaceFile) {
        let handler = this.getFileTypeHandler(file);
        return handler ? handler.getLanguageForFile(file) : null;
    }

    getLanguageByKey(language: string) {
        return this.getSupportedLanguages().find(lang => lang.getKey() === language) ?? null;
    }
}
