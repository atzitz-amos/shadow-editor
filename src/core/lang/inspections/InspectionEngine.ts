import {InspectionBase} from "./Inspection";
import {ProblemsHolder} from "./problems/ProblemsHolder";
import {SynFile} from "../syntax/api/SynFile";
import {SynRecursiveLazyVisitorImpl} from "../syntax/visitors/SynRecursiveLazyVisitorImpl";

/**
 *
 * @author Atzitz Amos
 * @date 6/4/2026
 * @since 1.0.0
 */
export class InspectionEngine {
    public constructor(private readonly inspections: InspectionBase[]) {

    }

    public runInspections(holder: ProblemsHolder, file: SynFile): void {
        const visitor = new SynRecursiveLazyVisitorImpl(this.inspections.map(i => i.buildVisitor(holder)));
        visitor.visitNode(file);
    }

    filter(func: (inspection: InspectionBase) => boolean) {
        return new InspectionEngine(this.inspections.filter(func));
    }
}
