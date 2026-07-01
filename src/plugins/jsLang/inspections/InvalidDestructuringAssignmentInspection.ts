import {InspectionBase} from "../../../core/lang/inspections/Inspection";
import {InspectionSeverity} from "../../../core/lang/inspections/InspectionSeverity";
import {ProblemsHolder} from "../../../core/lang/inspections/problems/ProblemsHolder";
import {LanguageBase} from "../../../core/lang/LanguageBase";
import {SynNodeVisitor} from "../../../core/lang/syntax/utils/visitors/SynNodeVisitor";
import JsLang from "../lang/JsLang";
import {JsSynVisitor} from "../lang/syntax/visitors/JsSynVisitor";
import {JsAssignmentExpr} from "../lang/syntax/expr/JsAssignmentExpr";
import {JsArrayLiteral} from "../lang/syntax/literal/JsArrayLiteral";
import {JsExpr} from "../lang/syntax/expr/JsExpr";
import {JsLiteral} from "../lang/syntax/literal/JsLiteral";
import {JsStringLiteral} from "../lang/syntax/literal/JsStringLiteral";
import {JsSpreadExpr} from "../lang/syntax/expr/JsSpreadExpr";

class DestructuringIterator {
    private readonly elements: JsExpr[];
    private index: number = 0;

    constructor(arr: JsArrayLiteral) {
        this.elements = arr.getElements();
    }

    hasNext(): boolean {
        return this.index < this.elements.length;
    }

    next(): JsExpr {
        if (this.hasNext()) {
            return this.elements[this.index++];
        } else {
            throw new Error("No more elements");
        }
    }

    seek(): JsExpr | null {
        if (this.hasNext()) {
            return this.elements[this.index];
        } else {
            return null;
        }
    }
}

/**
 *
 * @author Atzitz Amos
 * @date 6/3/2026
 * @since 1.0.0
 */
export default class InvalidDestructuringAssignmentInspection extends InspectionBase {
    getId(): string {
        return "javascript.inspections.invalidDestructuringAssignment";
    }

    getSeverity(): InspectionSeverity {
        return InspectionSeverity.ERROR;
    }

    getApplicableLanguages(): LanguageBase[] {
        return [JsLang.class]
    }

    buildVisitor(holder: ProblemsHolder): SynNodeVisitor {
        const inspection = this;

        return new class extends JsSynVisitor {
            visitAssignmentExpr(element: JsAssignmentExpr) {
                let left = element.getLeft();
                if (left instanceof JsArrayLiteral) {
                    if (element.getOperator().getValue() !== "=") {
                        holder.registerProblem(inspection, "Invalid destructuring assignment operator", element.getOperator());
                    } else {
                        this.validate(new DestructuringIterator(left), element.getRight());
                    }
                }
            }

            private validate(left: DestructuringIterator, right: JsExpr) {
                if (!(right instanceof JsArrayLiteral)) {
                    this.checkCannotBeIterable(right);
                    return; // Impossible to check without knowing if the right-hand side is iterable, so we skip validation
                }
                const rightElements = new DestructuringIterator(right);
                while (left.hasNext()) {
                    const leftElement = left.next();
                    if (leftElement instanceof JsSpreadExpr) {
                        if (left.seek() !== null) {
                            holder.registerProblem(inspection, "Rest element must be last element in destructuring assignment", leftElement);
                        }
                        return;
                    } else if (leftElement instanceof JsArrayLiteral) {
                        if (rightElements.seek() === null) {
                            holder.registerProblem(inspection, "Right-hand side of destructuring assignment has too few elements", right);
                            return;
                        }
                        this.validate(new DestructuringIterator(leftElement), rightElements.next());
                    } else {
                        if (rightElements.seek() === null) {
                            holder.registerProblem(inspection, "Right-hand side of destructuring assignment has too few elements", right);
                            return;
                        }
                        rightElements.next();
                    }
                }
            }

            private checkCannotBeIterable(element: JsExpr) {
                if (element instanceof JsLiteral && !(element instanceof JsStringLiteral)) {
                    holder.registerProblem(inspection, "Right-hand side of destructuring assignment is not iterable", element);
                }
            }
        }
    }
}

