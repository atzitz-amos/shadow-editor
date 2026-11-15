import {GlobalState} from "../../../../core/global/GlobalState";
import {LangRegistry} from "../../../../lang/LangRegistry";
import {Document} from "../../../../editor/core/document/Document";
import {LanguageBase} from "../../../../lang/LanguageBase";
import {KillSignalTriggeredError, TimeoutKillSignal} from "../../../../core/utils/KillSignal";
import {UseLogger} from "../../../../core/logging/logger/LoggerDecorators";
import {Logger} from "../../../../core/logging/logger/LoggerCore";
import {Editor} from "../../../../editor/Editor";
import {UUIDHelper} from "../../../../editor/utils/UUIDHelper";
import {Scheduler} from "../../../../core/scheduler/Scheduler";
import {PluginManager} from "../../../../core/plugins/PluginManager";
import {SynDocumentImpl} from "../../../../lang/syntax/impl/document/SynDocumentImpl";
import {SynDocument} from "../../../../lang/syntax/api/document/SynDocument";
import {ASTRecoveryBuilder} from "../../../../lang/syntax/builder/parser/optimizer/recovery/ASTRecoveryBuilder";
import {LanguageParserDefinition} from "../../../../lang/definitions/LanguageParserDefinition";
import {CodeAnalysisManager} from "../../../../lang/syntax/manager/CodeAnalysisManager";
import {CodeAnalysisPass} from "../../../../lang/codeAnalysis/analysis/api/CodeAnalysisPass";
import {CodeAnalysisUtils} from "../../../../lang/codeAnalysis/analysis/CodeAnalysisUtils";
import {
    InspectionsCodeAnalysisPass
} from "../../../../lang/codeAnalysis/inspections/analysis/InspectionsCodeAnalysisPass";
import {
    InspectionsCodeAnalysisPassProvider
} from "../../../../lang/codeAnalysis/inspections/analysis/InspectionsCodeAnalysisPassProvider";
import {
    AnnotatorsCodeAnalysisPassProvider
} from "../../../../lang/codeAnalysis/annotators/AnnotatorsCodeAnalysisPassProvider";
import {InspectionsRegistry} from "../../../../lang/codeAnalysis/inspections/InspectionsRegistry";
import {InspectionBase} from "../../../../lang/codeAnalysis/inspections/Inspection";
import {ProblemsHolder} from "../../../../lang/codeAnalysis/inspections/problems/ProblemsHolder";
import {SynSuiteGroups, SynSuiteInspection, SynSuiteTest, SynSuiteTestOptions} from "./SynSuiteTest";
import {SynSuiteExecution, SynSuiteTestResult, SynSuiteTimings} from "./SynSuiteTestResult";
import {SynSuiteTestStore} from "./SynSuiteTestStore";
import {SynSuiteTestsRunEvent} from "./events/SynSuiteTestsRunEvent";

export type SynSuiteSnapshotRequest = {
    name: string,
    /** Dotted path of the group of the test, the root by default. Created if it does not exist */
    group?: string,
    description?: string,
    options: SynSuiteTestOptions
}

/**
 * Raised when a test case cannot be created, the message is meant to be shown to the user.
 */
export class SynSuiteError extends Error {
}

/**
 * Creates and runs SynSuite test cases.
 * <p>
 * Every test runs in its own detached document with its own code analysis, independently of the editor:
 * the passes contributed to {@link CodeAnalysisManager} run as usual, except that annotators are skipped and
 * inspections are restricted to the plugins selected by the test. Snapshots go through that same pipeline, so
 * that a freshly created test always passes.
 *
 * @author Atzitz Amos
 * @date 6/4/2026
 * @since 1.0.0
 */
@UseLogger("SynSuiteEngine")
export class SynSuiteEngine {
    private static readonly PARSER_TIMEOUT = 1000;
    /** Longest a run of tests goes without letting the browser paint, in milliseconds */
    private static readonly FRAME_BUDGET = 16;
    private static readonly instance: SynSuiteEngine = new SynSuiteEngine();

    private declare readonly logger: Logger;

    private readonly lastResults: Map<string, SynSuiteTestResult> = new Map<string, SynSuiteTestResult>();

    public static getInstance() {
        return this.instance;
    }

    private static describeError(error: unknown): string {
        return error instanceof Error ? (error.stack ?? error.message) : String(error);
    }

    private static toInspections(holder: ProblemsHolder): SynSuiteInspection[] {
        return holder.getProblems()
            .map(problem => ({
                inspectionId: problem.getInspection().getId(),
                pluginId: InspectionsRegistry.definingPlugin(problem.getInspection())?.getId() ?? null,
                message: problem.getDescription(),
                range: {start: problem.getRange().getStart(), end: problem.getRange().getEnd()}
            }))
            .sort((a, b) => a.range.start - b.range.start
                || a.range.end - b.range.end
                || a.inspectionId.localeCompare(b.inspectionId));
    }

    public getStore(): SynSuiteTestStore {
        return SynSuiteTestStore.getInstance();
    }

    /**
     * @returns the remembered snapshot options, with "every plugin" resolved to the plugins currently loaded
     */
    public getDefaultSnapshotOptions(): SynSuiteTestOptions {
        const defaults = this.getStore().getSnapshotDefaults();
        return {
            includeInspections: defaults.includeInspections,
            pluginIds: defaults.pluginIds ?? PluginManager.getInstance().getPluginList().map(p => p.getPlugin().getId())
        };
    }

    /**
     * Creates a test case from the content of the file opened in the editor.
     *
     * @throws SynSuiteError if the test cannot be created
     */
    public snapshot(editor: Editor, request: SynSuiteSnapshotRequest): SynSuiteTest {
        const language = editor.getCurrentLanguage();
        if (!language) {
            throw new SynSuiteError("The opened file has no registered language");
        }

        return this.createTest(editor.getOpenedDocument().getTextContent(), language, request);
    }

    /**
     * Runs the code through the pipeline and stores the output as the expected snapshot of a new test case.
     *
     * @throws SynSuiteError if the test cannot be created
     */
    public createTest(code: string, language: LanguageBase, request: SynSuiteSnapshotRequest): SynSuiteTest {
        const name = request.name.trim();
        const group = request.group ?? SynSuiteGroups.ROOT;
        if (name === "") {
            throw new SynSuiteError("The test needs a name");
        }
        if (name.includes(".")) {
            throw new SynSuiteError("The name cannot contain dots, use groups to categorize tests");
        }
        if (group !== SynSuiteGroups.ROOT && !SynSuiteGroups.isValid(group)) {
            throw new SynSuiteError(`Invalid group '${group}'`);
        }
        if (this.getStore().find(group, name)) {
            throw new SynSuiteError(`A test named '${SynSuiteGroups.join(group, name)}' already exists`);
        }

        const options: SynSuiteTestOptions = {
            includeInspections: request.options.includeInspections,
            pluginIds: [...request.options.pluginIds]
        };

        const execution = this.execute(code, language, options);
        if (execution.timedOut) {
            throw new SynSuiteError(`The parser timed out after ${SynSuiteEngine.PARSER_TIMEOUT}ms`);
        }
        if (!execution.actual || execution.errors.length > 0) {
            throw new SynSuiteError("The code could not be analysed:\n" + execution.errors.join("\n"));
        }

        const now = Date.now();
        const test: SynSuiteTest = {
            id: UUIDHelper.newUUID(),
            name,
            group,
            description: request.description?.trim() ?? "",
            language: language.getKey(),
            code,
            options,
            expected: execution.actual,
            createdAt: now,
            updatedAt: now
        };

        this.getStore().add(test);
        this.lastResults.set(test.id, new SynSuiteTestResult(test, execution));
        return test;
    }

    public runTest(test: SynSuiteTest): SynSuiteTestResult {
        const result = this.doRunTest(test);
        GlobalState.getMainEventBus().syncPublish(new SynSuiteTestsRunEvent([result]));
        return result;
    }

    /**
     * Runs the tests one after the other, yielding to the event loop in between so that the UI stays responsive, and
     * letting the browser paint about once per {@link FRAME_BUDGET} so that the progress is seen as it happens.
     */
    public async runTests(tests: SynSuiteTest[] = this.getStore().getAll(),
                          onProgress?: (result: SynSuiteTestResult, done: number, total: number) => void): Promise<SynSuiteTestResult[]> {
        const results: SynSuiteTestResult[] = [];
        let lastFrame = performance.now();

        for (const test of tests) {
            const result = this.doRunTest(test);
            results.push(result);

            onProgress?.(result, results.length, tests.length);
            if (performance.now() - lastFrame < SynSuiteEngine.FRAME_BUDGET) {
                await Scheduler.yield();
            } else {
                await Scheduler.nextFrame();
                lastFrame = performance.now();
            }
        }

        GlobalState.getMainEventBus().syncPublish(new SynSuiteTestsRunEvent(results));
        return results;
    }

    public getLastResult(testId: string): SynSuiteTestResult | null {
        return this.lastResults.get(testId) ?? null;
    }

    /**
     * Makes the actual output of the result the new expected snapshot of its test.
     *
     * @throws SynSuiteError if the result has no output, or if the test was modified since the result was obtained
     */
    public acceptActual(result: SynSuiteTestResult): SynSuiteTest {
        const actual = result.getActual();
        if (!actual) {
            throw new SynSuiteError("The test did not produce any output to accept");
        }

        const current = this.getStore().get(result.getTest().id);
        if (!current) {
            throw new SynSuiteError("The test no longer exists");
        }
        if (current.updatedAt !== result.getTest().updatedAt) {
            throw new SynSuiteError("The test was modified since it ran, run it again before accepting its output");
        }

        const updated = this.getStore().update(current.id, {expected: actual})!;
        this.lastResults.delete(current.id);
        return updated;
    }

    public removeTest(testId: string): boolean {
        this.lastResults.delete(testId);
        return this.getStore().remove(testId);
    }

    // ---- organization ----

    /**
     * Renames the last segment of a group: "js.parser" renamed "syntax" becomes "js.syntax".
     *
     * @returns the new path of the group
     * @throws SynSuiteError if the name is invalid or already taken
     */
    public renameGroup(group: string, name: string): string {
        name = name.trim();
        if (!SynSuiteGroups.isValidSegment(name)) {
            throw new SynSuiteError(`Invalid group name '${name}': use letters, digits, _, $ and -`);
        }
        return this.relocateGroup(group, SynSuiteGroups.join(SynSuiteGroups.parent(group), name));
    }

    /**
     * Moves a group, with its content, into another group or to the root.
     *
     * @returns the new path of the group
     * @throws SynSuiteError if the group would be moved into itself, or a group of the same name is already there
     */
    public moveGroup(group: string, parent: string): string {
        if (SynSuiteGroups.isWithin(parent, group) && parent !== SynSuiteGroups.ROOT) {
            throw new SynSuiteError("A group cannot be moved into itself");
        }
        return this.relocateGroup(group, SynSuiteGroups.join(parent, SynSuiteGroups.lastSegment(group)));
    }

    /**
     * @throws SynSuiteError if a test of the same name is already in the group
     */
    public moveTest(testId: string, group: string): SynSuiteTest {
        const test = this.requireTest(testId);
        if (SynSuiteGroups.of(test) === group) return test;
        if (this.getStore().find(group, test.name)) {
            throw new SynSuiteError(`A test named '${SynSuiteGroups.join(group, test.name)}' already exists`);
        }
        return this.getStore().relocate(testId, {group})!;
    }

    /**
     * @throws SynSuiteError if the name is invalid or already taken in the group of the test
     */
    public renameTest(testId: string, name: string): SynSuiteTest {
        const test = this.requireTest(testId);
        name = name.trim();
        if (name === "" || name.includes(".")) {
            throw new SynSuiteError("A test name cannot be empty nor contain dots");
        }
        if (name === test.name) return test;
        if (this.getStore().find(SynSuiteGroups.of(test), name)) {
            throw new SynSuiteError(`A test named '${SynSuiteGroups.join(SynSuiteGroups.of(test), name)}' already exists`);
        }
        return this.getStore().relocate(testId, {name})!;
    }

    private relocateGroup(group: string, target: string): string {
        if (group === SynSuiteGroups.ROOT) throw new SynSuiteError("The root cannot be moved nor renamed");
        if (target === group) return group;
        if (this.getStore().hasGroup(target)) throw new SynSuiteError(`A group '${target}' already exists`);

        this.getStore().relocateGroup(group, target);
        return target;
    }

    private requireTest(testId: string): SynSuiteTest {
        const test = this.getStore().get(testId);
        if (!test) throw new SynSuiteError("The test no longer exists");
        return test;
    }

    private doRunTest(test: SynSuiteTest): SynSuiteTestResult {
        const language = LangRegistry.getLanguageByKey(test.language);
        const execution = language
            ? this.execute(test.code, language, test.options)
            : this.failedExecution(null, `Unknown language '${test.language}'`);

        const result = new SynSuiteTestResult(test, execution);
        this.lastResults.set(test.id, result);
        return result;
    }

    private execute(code: string, language: LanguageBase, options: SynSuiteTestOptions): SynSuiteExecution {
        const timings: SynSuiteTimings = {lexer: 0, parser: 0, analysis: 0};

        const definition = LanguageParserDefinition.getParserDefinition(language);
        if (!definition) {
            return this.failedExecution(null, `No parser registered for language '${language.getKey()}'`);
        }

        const document = new Document(code, language);
        const synDocument = new SynDocumentImpl(document, null);

        let start = performance.now();
        try {
            LangRegistry.getLexer(language).lexAll(document);
        } catch (e) {
            return this.failedExecution(synDocument, "The lexer crashed: " + SynSuiteEngine.describeError(e), timings);
        }
        timings.lexer = performance.now() - start;

        start = performance.now();
        try {
            const builder = new ASTRecoveryBuilder(synDocument, language, new TimeoutKillSignal(SynSuiteEngine.PARSER_TIMEOUT));
            definition.createParser(builder).parse();
            synDocument.commit(builder.getTree(), builder.getCheckpoints(), document.getModificationTimestamp());
        } catch (e) {
            timings.parser = performance.now() - start;
            if (e instanceof KillSignalTriggeredError) {
                return {actual: null, timings, timedOut: true, errors: [], synDocument};
            }
            return this.failedExecution(synDocument, "The parser crashed: " + SynSuiteEngine.describeError(e), timings);
        }
        timings.parser = performance.now() - start;

        const errors: string[] = [];
        const inspectionsPass = options.includeInspections
            ? new InspectionsCodeAnalysisPass(synDocument, this.getInspections(options.pluginIds))
            : null;

        start = performance.now();
        CodeAnalysisUtils.runCodeAnalysisPasses(
            synDocument,
            this.collectPasses(synDocument, inspectionsPass),
            (visitor, node, error, whileExiting) => errors.push(
                `${visitor.constructor.name || "Anonymous visitor"} threw while ${whileExiting ? "exiting" : "visiting"} `
                + `${node.constructor.name}: ${SynSuiteEngine.describeError(error)}`));
        timings.analysis = performance.now() - start;

        return {
            actual: {
                tree: synDocument.getTree().toTreeRepr(),
                inspections: inspectionsPass ? SynSuiteEngine.toInspections(inspectionsPass.getHolder()) : []
            },
            timings,
            timedOut: false,
            errors,
            synDocument
        };
    }

    /**
     * Instantiates the passes contributed to the code analysis, replacing the inspections pass by one restricted
     * to the selected plugins and leaving the annotators out as they only produce highlighting.
     */
    private collectPasses(synDocument: SynDocument, inspectionsPass: InspectionsCodeAnalysisPass | null) {
        const passes: { pass: CodeAnalysisPass<any>, priority: number }[] = [];

        for (const provider of CodeAnalysisManager.getInstance().getPassProviders()) {
            if (provider instanceof AnnotatorsCodeAnalysisPassProvider) continue;

            if (provider instanceof InspectionsCodeAnalysisPassProvider) {
                if (inspectionsPass) passes.push({pass: inspectionsPass, priority: provider.getPriority()});
                continue;
            }

            passes.push({pass: provider.createPass(synDocument), priority: provider.getPriority()});
        }

        return passes;
    }

    private getInspections(pluginIds: string[]): InspectionBase[] {
        return InspectionsRegistry.getAll()
            .filter(inspection => {
                const pluginId = InspectionsRegistry.definingPlugin(inspection)?.getId();
                return pluginId !== undefined && pluginIds.includes(pluginId);
            });
    }

    private failedExecution(synDocument: SynDocument | null, error: string,
                            timings: SynSuiteTimings = {lexer: 0, parser: 0, analysis: 0}): SynSuiteExecution {
        this.logger.warn(error);
        return {actual: null, timings, timedOut: false, errors: [error], synDocument};
    }
}
