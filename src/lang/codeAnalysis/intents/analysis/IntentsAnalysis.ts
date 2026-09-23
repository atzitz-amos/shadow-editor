import {SynDocument} from "../../../syntax/api/document/SynDocument";
import {IntentBase} from "../IntentBase";
import {SynNode} from "../../../syntax/api/SynNode";
import {IntentsRegistry} from "./IntentsRegistry";
import {Editor} from "../../../../editor/Editor";
import {SynDocumentManager} from "../../../syntax/manager/SynDocumentManager";

export type ApplicableIntent = {
    intent: IntentBase,
    node: SynNode
}

/**
 *
 * @author Atzitz Amos
 * @date 9/23/2026
 * @since 1.0.0
 */
export class IntentsAnalysis {
    private static readonly INSTANCE: IntentsAnalysis = new IntentsAnalysis();

    public static getInstance(): IntentsAnalysis {
        return IntentsAnalysis.INSTANCE;
    }

    getApplicableIntentsAt(document: SynDocument, offset: Offset): ApplicableIntent[] {
        let element = document.getTree().getDeepestChildAt(offset) as SynNode | null;
        const result: ApplicableIntent[] = [];
        while (element) {
            for (const intent of IntentsRegistry.getForLanguage(document.getLanguage())) {
                if (intent.getTargetTypes().some(type => element instanceof type) && intent.isApplicable(element)) {
                    result.push({intent, node: element});
                }
            }

            element = element.getParent()
        }

        return result;
    }

    getApplicableIntentsAtCaret(editor: Editor) {
        return this.getApplicableIntentsAt(SynDocumentManager.getOpenedSynDocument(editor), editor.getPrimaryCaret().getOffset());
    }
}
