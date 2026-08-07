import {SynDocument} from "../../../syntax/api/document/SynDocument";
import {ProblemsHolder} from "../problems/ProblemsHolder";
import {CodeAnalysisPassProvider} from "../../analysis/api/CodeAnalysisPassProvider";
import {Editor} from "../../../../editor/Editor";
import {CodeAnalysisPass} from "../../analysis/api/CodeAnalysisPass";
import {InspectionsCodeAnalysisPass} from "./InspectionsCodeAnalysisPass";
import {InspectionsRegistry} from "../InspectionsRegistry";

/**
 *
 * @author Atzitz Amos
 * @date 8/4/2026
 * @since 1.0.0
 */
export class InspectionsCodeAnalysisPassProvider extends CodeAnalysisPassProvider<ProblemsHolder> {
    public static readonly INSTANCE = new InspectionsCodeAnalysisPassProvider();

    createPass(editor: Editor, document: SynDocument): CodeAnalysisPass<ProblemsHolder> {
        return new InspectionsCodeAnalysisPass(document, InspectionsRegistry.getAll());
    }
}
