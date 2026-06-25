import {ProblemsHolder} from "../inspections/problems/ProblemsHolder";
import {SynSuitePersister} from "./SynSuitePersister";
import {GlobalState} from "../../global/GlobalState";
import {SynSuiteParserTest} from "./SynSuiteParserTest";
import {SynAutomatedTestResult} from "./SynAutomatedTestResult";
import {LangSupport} from "../LangSupport";
import {Document} from "../../../editor/core/document/Document";
import {LanguageBase} from "../LanguageBase";
import {ASTBuilder} from "../syntax/builder/parser/builder/ASTBuilder";
import {EmptyKillSignal} from "../syntax/builder/parser/builder/KillSignal";
import {SynFileImpl} from "../syntax/impl/SynFileImpl";
import {Logger} from "vite";
import {UseLogger} from "../../logging/logger/LoggerDecorators";
import {SynSuiteWindowRenderer} from "./renderer/SynSuiteWindowRenderer";

/**
 *
 * @author Atzitz Amos
 * @date 6/4/2026
 * @since 1.0.0
 */
@UseLogger("SynSuiteEngine")
export class SynSuiteEngine {
    private static readonly instance: SynSuiteEngine = new SynSuiteEngine();

    private declare readonly logger: Logger;

    public static getInstance() {
        return this.instance;
    }

    public snapshot(key: string, pluginId: string, description?: string) {
        const editor = GlobalState.getMainEditor();

        if (editor.getCurrentLanguage() === null) {
            console.warn("Trying to snapshot a file with no registered language, skipping");
            return;
        }

        const file = editor.getLangService().getSynFile();
        const content = editor.getOpenedDocument().getTextContent();

        const holder = new ProblemsHolder(file);
        editor.getLangSupport().getInspectionEngineForLanguage(editor.getCurrentLanguage()!)
            .filter(inspection => LangSupport.definingPlugin(inspection) === pluginId)
            .runInspections(holder, file);

        const problems = holder.getProblems().map(p => ({
            inspectionKey: p.getInspection().getId(),
            message: p.getDescription(),
            range: {start: p.getRange().getStart(), end: p.getRange().end}
        }));

        SynSuitePersister.getInstance().addTest(pluginId, {
            pluginId,
            key,
            description: description ?? "",
            language: editor.getCurrentLanguage()!.getKey(),
            code: content,
            expectedTree: file.toTreeRepr(),
            expectedInspections: problems
        });
    }

    public getAllTests(): Map<string, SynSuiteParserTest[]> {
        return SynSuitePersister.getInstance().getAllTests();
    }

    clearPlugin(pluginId: string) {
        SynSuitePersister.getInstance().clearTestsForPlugin(pluginId);
    }

    clearTests() {
        SynSuitePersister.getInstance().clearAllTests();
    }

    patchTest(pluginId: string, testKey: string, patch: Partial<SynSuiteParserTest> | null) {
        SynSuitePersister.getInstance().patchTest(pluginId, testKey, patch);
    }

    public runTests(pluginId: string, openPopup: boolean = false, profile: boolean = false): Map<string, SynAutomatedTestResult> {
        const tests = SynSuitePersister.getInstance().getTests(pluginId);
        const results = new Map<string, SynAutomatedTestResult>();

        if (profile) console.profile("Running SynSuite tests for plugin " + pluginId);
        for (const test of tests) {
            let result = this.runTest(pluginId, test, LangSupport.getInstance().getLanguageByKey(test.language));
            results.set(test.key, result);
        }

        if (profile) console.profileEnd("Running SynSuite tests for plugin " + pluginId);
        if (openPopup) new SynSuiteWindowRenderer().render(results);

        return results;
    }

    getTestsForPlugin(name: string) {
        return SynSuitePersister.getInstance().getTests(name);
    }

    private runTest(pluginId: string, test: SynSuiteParserTest, lang: LanguageBase | null): SynAutomatedTestResult {
        if (lang === null) {
            return new SynAutomatedTestResult(
                test,
                ["Language not found for test, cannot run"],
                "",
                [],
                0,
                0,
                0
            );
        }

        // Overhead
        const document = new Document(0, test.code, lang);
        let synFile: SynFileImpl = new SynFileImpl(document);
        const holder = new ProblemsHolder(synFile);

        const lexStart = performance.now();
        lang.createLexer().lexAll(document);
        const lexEnd = performance.now();

        const astBuilder = new ASTBuilder(document.getTokenCache().createTokenStream(), new EmptyKillSignal(), synFile);
        lang.createParser(astBuilder).parse();
        astBuilder.close();
        const parseEnd = performance.now();

        LangSupport.getInstance().getInspectionEngineForLanguage(lang)
            .filter(inspection => LangSupport.definingPlugin(inspection) === pluginId)
            .runInspections(holder, synFile);
        const inspectEnd = performance.now();

        const treeRepr = synFile.toTreeRepr();
        const inspections = holder.getProblems().map(p => ({
            inspectionKey: p.getInspection().getId(),
            message: p.getDescription(),
            range: {start: p.getRange().getStart(), end: p.getRange().getEnd()}
        }));

        return new SynAutomatedTestResult(
            test,
            [],
            treeRepr,
            inspections,
            lexEnd - lexStart,
            parseEnd - lexEnd,
            inspectEnd - parseEnd
        )
    }
}
