import {SynDocument} from "../../syntax/api/document/SynDocument";
import {CodeAnalysisPass} from "./api/CodeAnalysisPass";
import {SynLazyVisitorOptimizer, VisitorErrorHandler} from "../../syntax/visitors/SynLazyVisitorOptimizer";
import {SynNodeVisitor} from "../../syntax/visitors/SynNodeVisitor";
import {CollectionUtils} from "../../../editor/utils/collection/CollectionUtils";

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

    /**
     * Runs several passes over the document in a single traversal per priority, lowest priority first,
     * without touching the document's {@link SynDocument.getCodeAnalysisHolder() code analysis holder}.
     */
    public static runCodeAnalysisPasses(document: SynDocument,
                                        passes: { pass: CodeAnalysisPass<any>, priority: number }[],
                                        onError?: VisitorErrorHandler): void {
        const visitors = new Map<number, SynNodeVisitor[]>();
        for (const {pass, priority} of passes) {
            CollectionUtils.getOrSet(visitors, priority, () => []).push(...pass.collectVisitors());
        }

        new SynLazyVisitorOptimizer(visitors, onError).visitNode(document.getTree());
    }
}
