import {Service, ServiceImpl} from "../../../core/threaded/service/Service";
import {GlobalState} from "../../../core/global/GlobalState";
import {SynTreeChangedEvent} from "../../../editor/core/lang/events/SynTreeChangedEvent";
import {ExtensionPoint} from "../../../core/plugins/extensionPoints/ExtensionPoint";
import {CodeAnalysisPass} from "./api/CodeAnalysisPass";
import {SynNodeVisitor} from "../../syntax/visitors/SynNodeVisitor";
import {SynLazyVisitorOptimizer} from "../../syntax/visitors/SynLazyVisitorOptimizer";
import {CodeAnalysisPassProvider} from "./api/CodeAnalysisPassProvider";
import {InspectionsCodeAnalysisPassProvider} from "../inspections/analysis/InspectionsCodeAnalysisPassProvider";
import {AnnotatorsCodeAnalysisPassProvider} from "../annotators/AnnotatorsCodeAnalysisPassProvider";
import {Scheduler} from "../../../core/scheduler/Scheduler";
import {SynDocumentUtils} from "../../syntax/utils/SynDocumentUtils";
import {ReferenceCollectorAnalysisPassProvider} from "../references/collector/ReferenceCollectorAnalysisPassProvider";

/**
 *
 * @author Atzitz Amos
 * @date 8/3/2026
 * @since 1.0.0
 */
@Service
export class CodeAnalysisService implements ServiceImpl {
    private static readonly INSTANCE = new CodeAnalysisService();

    private static readonly codeAnalysisPassEP = new ExtensionPoint("codeAnalysis/pass", CodeAnalysisPassProvider)
        .withDefaultContributors(
            ReferenceCollectorAnalysisPassProvider.INSTANCE,
            InspectionsCodeAnalysisPassProvider.INSTANCE,
            AnnotatorsCodeAnalysisPassProvider.INSTANCE
        );

    public static getInstance(): CodeAnalysisService {
        return this.INSTANCE;
    }

    begin(): void {
        GlobalState.getMainEventBus().subscribe(this, SynTreeChangedEvent.SUBSCRIBER, this.onSynTreeChanged)
    }

    private onSynTreeChanged(event: SynTreeChangedEvent) {
        Scheduler.debounce(() => {
            const providers = CodeAnalysisService.codeAnalysisPassEP.getAll();

            const visitors: SynNodeVisitor[] = [];
            const passes: CodeAnalysisPass<any>[] = [];

            for (const provider of providers) {
                const pass = provider.createPass(event.getEditor(), event.getSynDocument());
                visitors.push(...pass.collectVisitors());
                passes.push(pass);
            }

            new SynLazyVisitorOptimizer(visitors).visitNode(event.getSynDocument().getTree());

            for (const pass of passes) {
                pass.processResults(event.getEditor());
            }
        }, 100 * SynDocumentUtils.getDocumentLengthTier(event.getSynDocument().getDocument()));
    }
}
