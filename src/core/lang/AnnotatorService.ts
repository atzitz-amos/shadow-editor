import {Service} from "../threaded/service/Service";
import {UseLogger} from "../logging/logger/LoggerDecorators";
import {Logger} from "../logging/logger/LoggerCore";
import {GlobalState} from "../global/GlobalState";
import {SynTreeChangedEvent} from "../../editor/core/lang/events/SynTreeChangedEvent";
import {ProblemsHolder} from "./inspections/problems/ProblemsHolder";
import {InlineInspection} from "../../editor/ui/inline/inspection/InlineInspection";
import {KeyTypedEvent} from "../../editor/events/PhysicalEvents";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
@Service
@UseLogger("AnnotatorService")
export class AnnotatorService {
    private static instance: AnnotatorService;

    private readonly declare logger: Logger;

    constructor() {

    }

    public static getInstance(): AnnotatorService {
        if (!AnnotatorService.instance) {
            AnnotatorService.instance = new AnnotatorService();
        }
        return AnnotatorService.instance;
    }

    public begin() {
        GlobalState.getMainEventBus().subscribe(this, SynTreeChangedEvent.SUBSCRIBER, this.onSynTreeChanged);
    }

    private onSynTreeChanged(event: SynTreeChangedEvent) {
        event.getEditor().getWidgetManager().removeByName("inline-inspection");

        const holder = new ProblemsHolder(event.getFile());

        event.getEditor().getLangSupport().getInspectionEngineForLanguage(event.getLanguage())
            .runInspections(holder, event.getFile());

        // console.log(holder.getProblems().map(p => `${p.getDescription()} at ${p.getRange().toString()}`));

        for (const problem of holder.getProblems()) {
            event.getEditor()
                .getWidgetManager()
                .addOverlayWidget(new InlineInspection(problem.getRange(), problem.getInspection().getSeverity(), problem.getDescription()));
        }

        event.getEditor().getView().triggerOverlaysRepaint();
    }
}
