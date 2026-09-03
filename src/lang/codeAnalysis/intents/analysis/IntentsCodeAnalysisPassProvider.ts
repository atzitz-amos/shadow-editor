import {Editor} from "../../../../editor/Editor";
import {SynDocument} from "../../../syntax/api/document/SynDocument";
import {CodeAnalysisPass} from "../../analysis/api/CodeAnalysisPass";
import {CodeAnalysisPassProvider} from "../../analysis/api/CodeAnalysisPassProvider";
import {IntentsHolder} from "../holder/IntentsHolder";
import {IntentsCodeAnalysisPass} from "./IntentsCodeAnalysisPass";
import {ExtensionPoint} from "../../../../core/plugins/extensionPoints/ExtensionPoint";
import {IntentBase} from "../IntentBase";

/**
 *
 * @author Atzitz Amos
 * @date 8/30/2026
 * @since 1.0.0
 */
export class IntentsCodeAnalysisPassProvider extends CodeAnalysisPassProvider<IntentsHolder> {
    public static readonly INSTANCE = new IntentsCodeAnalysisPassProvider();

    private static readonly intentsEP: ExtensionPoint<IntentBase> = new ExtensionPoint("intents", IntentBase);

    createPass(editor: Editor, document: SynDocument): CodeAnalysisPass<IntentsHolder> {
        return new IntentsCodeAnalysisPass(document, IntentsCodeAnalysisPassProvider.intentsEP.getAll());
    }
}
