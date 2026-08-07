import {SynDocument} from "../../syntax/api/document/SynDocument";
import {CodeAnalysisPass} from "./api/CodeAnalysisPass";
import {SynLazyVisitorOptimizer} from "../../syntax/visitors/SynLazyVisitorOptimizer";

/**
 *
 * @author Atzitz Amos
 * @date 8/4/2026
 * @since 1.0.0
 */
export class CodeAnalysisUtils {
    public static runCodeAnalysisPass<T>(document: SynDocument, codeAnalysis: CodeAnalysisPass<T>): T {
        const visitors = codeAnalysis.collectVisitors();
        new SynLazyVisitorOptimizer(visitors).visitNode(document.getTree());
        return codeAnalysis.getHolder();
    }
}
