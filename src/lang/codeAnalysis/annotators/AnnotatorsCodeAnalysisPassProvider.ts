import {CodeAnalysisPassProvider} from "../analysis/api/CodeAnalysisPassProvider";
import {HighlightHolder} from "../../../editor/ui/highlighter/HighlightHolder";
import {Editor} from "../../../editor/Editor";
import {SynDocument} from "../../syntax/api/document/SynDocument";
import {CodeAnalysisPass} from "../analysis/api/CodeAnalysisPass";
import {ExtensionPoint} from "../../../core/plugins/extensionPoints/ExtensionPoint";
import {AnnotatorBase} from "./AnnotatorBase";
import {AnnotatorsCodeAnalysisPass} from "./AnnotatorsCodeAnalysisPass";

/**
 *
 * @author Atzitz Amos
 * @date 8/4/2026
 * @since 1.0.0
 */
export class AnnotatorsCodeAnalysisPassProvider extends CodeAnalysisPassProvider<HighlightHolder> {
    public static readonly INSTANCE = new AnnotatorsCodeAnalysisPassProvider();

    private static readonly annotatorsEP: ExtensionPoint<AnnotatorBase> = new ExtensionPoint("annotators", AnnotatorBase);

    createPass(editor: Editor, document: SynDocument): CodeAnalysisPass<HighlightHolder> {
        return new AnnotatorsCodeAnalysisPass(document, AnnotatorsCodeAnalysisPassProvider.annotatorsEP.getAll());
    }
}
