import {Editor} from "../../../../editor/Editor";
import {SynDocument} from "../../../syntax/api/document/SynDocument";
import {CodeAnalysisPass} from "./CodeAnalysisPass";

/**
 *
 * @author Atzitz Amos
 * @date 8/4/2026
 * @since 1.0.0
 */
export abstract class CodeAnalysisPassProvider<T> {
    abstract createPass(editor: Editor, document: SynDocument): CodeAnalysisPass<T>;
}
