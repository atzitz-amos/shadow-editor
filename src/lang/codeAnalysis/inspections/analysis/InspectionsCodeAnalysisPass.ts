import {Editor} from "../../../../editor/Editor";
import {SynNodeVisitor} from "../../../syntax/visitors/SynNodeVisitor";
import {CodeAnalysisPass} from "../../analysis/api/CodeAnalysisPass";
import {ProblemsHolder} from "../problems/ProblemsHolder";
import {InspectionBase} from "../Inspection";
import {InlineInspection} from "../../../../editor/ui/inline/inspection/InlineInspection";
import {SynDocument} from "../../../syntax/api/document/SynDocument";

/**
 *
 * @author Atzitz Amos
 * @date 8/3/2026
 * @since 1.0.0
 */
export class InspectionsCodeAnalysisPass implements CodeAnalysisPass<ProblemsHolder> {
    private readonly holder: ProblemsHolder;

    constructor(private readonly document: SynDocument, private readonly inspections: InspectionBase[]) {
        this.holder = new ProblemsHolder(document);
    }

    getPriority(): number {
        return 1;
    }

    collectVisitors(): SynNodeVisitor[] {
        return this.inspections
            .filter(x => x.getApplicableLanguages().includes(this.document.getLanguage()))
            .map(x => x.buildVisitor(this.holder));
    }

    getHolder(): ProblemsHolder {
        return this.holder;
    }

    processResults(editor: Editor): void {
        editor.getWidgetManager().removeByName("inline-inspection");

        for (const problem of this.holder.getProblems()) {
            editor.getWidgetManager().addOverlayWidget(new InlineInspection(
                problem.getRange(),
                problem.getInspection().getSeverity(),
                problem.getDescription()
            ));
        }

        editor.getView().triggerOverlaysRepaint();
    }

    runOnlyOnVisibleNodes(): boolean {
        return false;
    }

}
