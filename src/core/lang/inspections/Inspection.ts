import {InspectionSeverity} from "./InspectionSeverity";
import {LanguageBase} from "../LanguageBase";
import {SynNodeVisitor} from "../syntax/utils/visitors/SynNodeVisitor";
import {ProblemsHolder} from "./problems/ProblemsHolder";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export abstract class InspectionBase {
    abstract getId(): string;

    abstract getSeverity(): InspectionSeverity;

    abstract getApplicableLanguages(): LanguageBase[];

    abstract buildVisitor(holder: ProblemsHolder): SynNodeVisitor;
}
