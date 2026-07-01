import {InspectionBase} from "./Inspection";
import {ProblemsHolder} from "./problems/ProblemsHolder";
import {SynFile} from "../syntax/api/filesystem/SynFile";
import {SynLazyVisitorOptimizer} from "../syntax/utils/visitors/SynLazyVisitorOptimizer";
import {SynDocument} from "../syntax/api/document/SynDocument";

/**
 *
 * @author Atzitz Amos
 * @date 6/4/2026
 * @since 1.0.0
 */
export class InspectionEngine {
    public constructor(private readonly inspections: InspectionBase[]) {

    }

    public runInspections(holder: ProblemsHolder, document: SynDocument): void {
        const visitor = new SynLazyVisitorOptimizer(this.inspections.map(i => i.buildVisitor(holder)));
        visitor.visitNode(document.getTree());
    }

    filter(func: (inspection: InspectionBase) => boolean) {
        return new InspectionEngine(this.inspections.filter(func));
    }
}
