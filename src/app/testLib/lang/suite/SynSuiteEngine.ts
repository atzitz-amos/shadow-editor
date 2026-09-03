import {SynSuitePersister} from "./SynSuitePersister";
import {GlobalState} from "../../../../core/global/GlobalState";
import {SynSuiteParserTest} from "./SynSuiteParserTest";
import {SynAutomatedTestResult} from "./SynAutomatedTestResult";
import {LangRegistry} from "../../../../lang/LangRegistry";
import {Document} from "../../../../editor/core/document/Document";
import {LanguageBase} from "../../../../lang/LanguageBase";
import {ASTBuilder} from "../../../../lang/syntax/builder/parser/builder/ASTBuilder";
import {KillSignalTriggeredError, TimeoutKillSignal} from "../../../../core/utils/KillSignal";
import {UseLogger} from "../../../../core/logging/logger/LoggerDecorators";
import {SynSuiteWindowRenderer} from "./renderer/SynSuiteWindowRenderer";
import {SynDocument} from "../../../../lang/syntax/api/document/SynDocument";
import {SynDocumentManager} from "../../../../lang/syntax/manager/SynDocumentManager";
import {Logger} from "../../../../core/logging/logger/LoggerCore";
import {
    InspectionsCodeAnalysisPass
} from "../../../../lang/codeAnalysis/inspections/analysis/InspectionsCodeAnalysisPass";
import {InspectionsRegistry} from "../../../../lang/codeAnalysis/inspections/InspectionsRegistry";
import {CodeAnalysisUtils} from "../../../../lang/codeAnalysis/analysis/CodeAnalysisUtils";
import {SynTree} from "../../../../lang/syntax/api/tree/SynTree";

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

        const document = editor.getCodeAnalysisService().getSynFile().getSynDocument();
        const content = editor.getOpenedDocument().getTextContent();

        const holder = CodeAnalysisUtils.runCodeAnalysisPass(document, new InspectionsCodeAnalysisPass(
            document,
            InspectionsRegistry.getForPlugin(pluginId)
        ));

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
            expectedTree: document.getTree().toTreeRepr(),
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
            let result = this.runTest(pluginId, test, LangRegistry.getInstance().getLanguageByKey(test.language));
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
        const document = new Document(test.code, lang);
        let synDocument: SynDocument = SynDocumentManager.createVirtualSynDocument(document);

        const lexStart = performance.now();
        lang.createLexer().lexAll(document);
        const lexEnd = performance.now();

        let astBuilder: ASTBuilder, tree: SynTree, parseEnd: number;
        try {
            astBuilder = new ASTBuilder(synDocument, synDocument.getLanguage(), new TimeoutKillSignal(1000));
            lang.createParser(astBuilder).parse();
            tree = astBuilder.getTree();
            synDocument.commit(tree, document.getModificationTimestamp());
            parseEnd = performance.now();
        } catch (e) {
            if (e instanceof KillSignalTriggeredError) {
                return new SynAutomatedTestResult(
                    test,
                    ["Parser timed out"],
                    "",
                    [],
                    lexEnd - lexStart,
                    0,
                    0,
                    true);
            } else throw e;
        }

        const holder = CodeAnalysisUtils.runCodeAnalysisPass(synDocument, new InspectionsCodeAnalysisPass(
            synDocument, InspectionsRegistry.getForPlugin(pluginId)
        ))
        const inspectEnd = performance.now();

        const treeRepr = synDocument.getTree().toTreeRepr();
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
