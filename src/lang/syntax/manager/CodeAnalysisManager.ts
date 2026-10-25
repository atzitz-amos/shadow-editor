import {CodeAnalysisPass} from "../../codeAnalysis/analysis/api/CodeAnalysisPass";
import {SynDocument} from "../api/document/SynDocument";
import {SynNodeVisitor} from "../visitors/SynNodeVisitor";
import {CollectionUtils} from "../../../editor/utils/collection/CollectionUtils";
import {SynLazyVisitorOptimizer} from "../visitors/SynLazyVisitorOptimizer";
import {ExtensionPoint} from "../../../core/plugins/extensionPoints/ExtensionPoint";
import {
    ReferenceCollectorAnalysisPassProvider
} from "../../codeAnalysis/references/collector/ReferenceCollectorAnalysisPassProvider";
import {
    InspectionsCodeAnalysisPassProvider
} from "../../codeAnalysis/inspections/analysis/InspectionsCodeAnalysisPassProvider";
import {AnnotatorsCodeAnalysisPassProvider} from "../../codeAnalysis/annotators/AnnotatorsCodeAnalysisPassProvider";
import {CodeAnalysisPassProvider} from "../../codeAnalysis/analysis/api/CodeAnalysisPassProvider";

/**
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class CodeAnalysisManager {
    private static readonly instance: CodeAnalysisManager = new CodeAnalysisManager();

    private static readonly codeAnalysisPassEP = new ExtensionPoint("codeAnalysis/pass", CodeAnalysisPassProvider)
        .withDefaultContributors(
            ReferenceCollectorAnalysisPassProvider.INSTANCE,
            InspectionsCodeAnalysisPassProvider.INSTANCE,
            AnnotatorsCodeAnalysisPassProvider.INSTANCE
        );

    public static getInstance() {
        return this.instance;
    }

    public ensureUpToDate(synDocument: SynDocument) {
        if (synDocument.getModificationTimestamp() === synDocument.getCodeAnalysisHolder().getLastUpdatedTimestamp()) {
            return synDocument.getCodeAnalysisHolder();
        }
        this.runCodeAnalysis(synDocument);
        return synDocument.getCodeAnalysisHolder();
    }

    public getPassProviders(): CodeAnalysisPassProvider<any>[] {
        return CodeAnalysisManager.codeAnalysisPassEP.getAll();
    }

    public forceRunCodeAnalysis(synDocument: SynDocument) {
        this.runCodeAnalysis(synDocument);
    }

    private runCodeAnalysis(synDocument: SynDocument) {
        const providers = CodeAnalysisManager.codeAnalysisPassEP.getAll();

        const visitors: Map<number, SynNodeVisitor[]> = new Map<number, SynNodeVisitor[]>();
        const passes: CodeAnalysisPass<any>[] = [];

        for (const provider of providers) {
            const pass = provider.createPass(synDocument);
            CollectionUtils.getOrSet(visitors, provider.getPriority(), () => []).push(...pass.collectVisitors());
            passes.push(pass);
        }

        new SynLazyVisitorOptimizer(visitors).visitNode(synDocument.getTree());

        synDocument.getCodeAnalysisHolder().setCodeAnalysisPasses(passes);
    }
}
