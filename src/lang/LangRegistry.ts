/*
 * Author: Atzitz Amos
 * Date: 10/10/2025
 */

import {LanguageBase} from "./LanguageBase";
import {FileTypeHandler} from "./FileTypeHandler";
import {ProjectFile} from "../core/project/filesystem/tree/ProjectFile";
import {InspectionBase} from "./codeAnalysis/inspections/Inspection";
import {ExtensionPoint} from "../core/plugins/extensionPoints/ExtensionPoint";
import {SmartInlineInsertAction} from "./codeAnalysis/smart/insert/SmartInlineInsertAction";
import {SmartInlineDeleteAction} from "./codeAnalysis/smart/delete/SmartInlineDeleteAction";
import {SmartInlineHighlight} from "./codeAnalysis/smart/highlight/SmartInlineHighlight";
import {TokenHoverAction} from "./codeAnalysis/tokenhover/TokenHoverAction";
import {SmartInlineEnterAction} from "./codeAnalysis/smart/enter/SmartInlineEnterAction";
import {ILexer} from "./syntax/builder/lexer/ILexer";
import {HighlighterBase} from "./highlighter/HighlighterBase";
import {CollectionUtils} from "../editor/utils/collection/CollectionUtils";
import {IncrementalHighlighter} from "./highlighter/IncrementalHighlighter";
import {ASTBuilder} from "./syntax/builder/parser/builder/ASTBuilder";

export class LangRegistry {
    private static instance: LangRegistry;

    private static readonly languageEP: ExtensionPoint<LanguageBase> = new ExtensionPoint("lang", LanguageBase);
    private static readonly fileTypeEP: ExtensionPoint<FileTypeHandler> = new ExtensionPoint("lang", FileTypeHandler);

    private static readonly smartInsertEP: ExtensionPoint<SmartInlineInsertAction> = new ExtensionPoint("smart", SmartInlineInsertAction);
    private static readonly smartDeleteEP: ExtensionPoint<SmartInlineDeleteAction> = new ExtensionPoint("smart", SmartInlineDeleteAction);
    private static readonly smartEnterEP: ExtensionPoint<SmartInlineEnterAction> = new ExtensionPoint("smart", SmartInlineEnterAction);
    private static readonly smartHighlightEP: ExtensionPoint<SmartInlineHighlight> = new ExtensionPoint("smart", SmartInlineHighlight);

    private static readonly tokenHoverEP: ExtensionPoint<TokenHoverAction> = new ExtensionPoint("tokenhover", TokenHoverAction);

    private static readonly lexerByLanguage: Map<string, ILexer> = new Map();
    private static readonly highlighterByLanguage: Map<string, HighlighterBase> = new Map();

    constructor() {
    }

    public static getInstance(): LangRegistry {
        if (!this.instance) {
            this.instance = new LangRegistry();
        }
        return this.instance;
    }

    static definingPlugin(cls: LanguageBase | FileTypeHandler | InspectionBase): string | undefined {
        if (cls instanceof LanguageBase) {
            return this.languageEP.definingPlugin(cls)?.getId();
        } else if (cls instanceof FileTypeHandler) {
            return this.fileTypeEP.definingPlugin(cls)?.getId();
        }
    }

    static getLanguageByKey(key: string): LanguageBase | null {
        return this.getInstance().getLanguageByKey(key);
    }

    static getHighlighter(language: LanguageBase) {
        const highlighterBase = CollectionUtils.getOrSet(this.highlighterByLanguage, language.getKey(), () => language.createHighlighter());
        return new IncrementalHighlighter(highlighterBase);
    }

    static getLexer(language: LanguageBase) {
        return CollectionUtils.getOrSet(this.lexerByLanguage, language.getKey(), () => language.createLexer());
    }

    static createParser(language: LanguageBase, builder: ASTBuilder) {
        return language.createParser(builder);
    }

    getSupportedLanguages(): LanguageBase[] {
        return LangRegistry.languageEP.getAll();
    }

    getLanguageByKey(language: string) {
        return this.getSupportedLanguages().find(lang => lang.getKey() === language) ?? null;
    }

    getAllSmartInsertActions(language: LanguageBase): SmartInlineInsertAction[] {
        return LangRegistry.smartInsertEP.getAll()
            .filter(action => action.getApplicableLanguages().includes(language))
            .toSorted((a, b) => b.getPriority() - a.getPriority());
    }

    getAllSmartDeleteActions(language: LanguageBase): SmartInlineDeleteAction[] {
        return LangRegistry.smartDeleteEP.getAll()
            .filter(action => action.getApplicableLanguages().includes(language))
            .toSorted((a, b) => b.getPriority() - a.getPriority());
    }

    getAllSmartEnterActions(language: LanguageBase): SmartInlineEnterAction[] {
        return LangRegistry.smartEnterEP.getAll().filter(action => action.getApplicableLanguages().includes(language))
            .toSorted((a, b) => b.getPriority() - a.getPriority());
    }

    getAllSmartHighlights(language: LanguageBase): SmartInlineHighlight[] {
        return LangRegistry.smartHighlightEP.getAll().filter(action => action.getApplicableLanguages().includes(language))
            .toSorted((a, b) => b.getPriority() - a.getPriority());
    }

    getAllTokenHoverActions(language: LanguageBase): TokenHoverAction[] {
        return LangRegistry.tokenHoverEP.getAll().filter(action => action.getApplicableLanguages().includes(language));
    }

    getAllFileTypeHandlers(): FileTypeHandler[] {
        return LangRegistry.fileTypeEP.getAll();
    }

    getFileTypeHandler(file: ProjectFile): FileTypeHandler | null {
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

    getAssociatedLanguage(file: ProjectFile) {
        let handler = this.getFileTypeHandler(file);
        return handler ? handler.getLanguageForFile(file) : null;
    }
}
