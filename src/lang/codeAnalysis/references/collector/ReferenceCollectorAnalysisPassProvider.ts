import {Editor} from "../../../../editor/Editor";
import {SynDocument} from "../../../syntax/api/document/SynDocument";
import {CodeAnalysisPass} from "../../analysis/api/CodeAnalysisPass";
import {CodeAnalysisPassProvider} from "../../analysis/api/CodeAnalysisPassProvider";
import {ReferenceCollectorAnalysisPass} from "./ReferenceCollectorAnalysisPass";

/**
 *
 * @author Atzitz Amos
 * @date 8/28/2026
 * @since 1.0.0
 */
export class ReferenceCollectorAnalysisPassProvider extends CodeAnalysisPassProvider<null> {
    public static readonly INSTANCE: ReferenceCollectorAnalysisPassProvider = new ReferenceCollectorAnalysisPassProvider();

    createPass(editor: Editor, document: SynDocument): CodeAnalysisPass<null> {
        return new ReferenceCollectorAnalysisPass(document);
    }
}
