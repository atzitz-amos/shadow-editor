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
import {Editor} from "../../../editor/Editor";
import {GlobalState} from "../../../core/global/GlobalState";
import {SynEditorTreeChangedEvent} from "../../../editor/core/lang/events/SynEditorTreeChangedEvent";
import {SynDocumentManager} from "../../syntax/manager/SynDocumentManager";
import {SynDocument} from "../../syntax/api/document/SynDocument";

/**
 *
 * @author Atzitz Amos
 * @date 8/3/2026
 * @since 1.0.0
 */
export class CodeAnalysisService {
    private static readonly codeAnalysisPassEP = new ExtensionPoint("codeAnalysis/pass", CodeAnalysisPassProvider)
        .withDefaultContributors(
            ReferenceCollectorAnalysisPassProvider.INSTANCE,
            InspectionsCodeAnalysisPassProvider.INSTANCE,
            AnnotatorsCodeAnalysisPassProvider.INSTANCE
        );

    private lastUpdatedTimestamp: number = -1;

    constructor(private readonly editor: Editor) {
        GlobalState.getMainEventBus().subscribe(this, SynTreeChangedEvent.SUBSCRIBER, e => {
            if (e.getSynDocument().getDocument() == editor.getOpenedDocument()) {
                this.onSynTreeChanged(e);
                editor.getEventBus().asyncPublish(new SynEditorTreeChangedEvent(editor, e.getSynDocument()));
            }
        });
    }

    restart() {
        if (!this.editor.getCurrentLanguage()) return;
        const synDocument = SynDocumentManager.getOpenedSynDocument(this.editor);
        this.invokePasses(synDocument);
    }

    private onSynTreeChanged(event: SynTreeChangedEvent) {
        Scheduler.debounce(() => {
            this.invokePasses(event.getSynDocument());
        }, 100 * SynDocumentUtils.getDocumentLengthTier(event.getSynDocument().getDocument()));
    }

    private invokePasses(synDocument: SynDocument) {
        if (this.lastUpdatedTimestamp >= synDocument.getModificationTimestamp()) {
            return;
        }

        const providers = CodeAnalysisService.codeAnalysisPassEP.getAll();

        const visitors: SynNodeVisitor[] = [];
        const passes: CodeAnalysisPass<any>[] = [];

        for (const provider of providers) {
            const pass = provider.createPass(this.editor, synDocument);
            visitors.push(...pass.collectVisitors());
            passes.push(pass);
        }

        new SynLazyVisitorOptimizer(visitors).visitNode(synDocument.getTree());

        for (const pass of passes) {
            pass.processResults(this.editor);
        }

        this.lastUpdatedTimestamp = synDocument.getModificationTimestamp();
    }
}
