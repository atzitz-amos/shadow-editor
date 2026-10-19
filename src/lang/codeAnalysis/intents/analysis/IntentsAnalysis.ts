import {IntentBase} from "../IntentBase";
import {SynNode} from "../../../syntax/api/SynNode";
import {IntentsRegistry} from "./IntentsRegistry";
import {Editor} from "../../../../editor/Editor";
import {SynDocumentManager} from "../../../syntax/manager/SynDocumentManager";
import {SynModTree} from "../../../codeGen/modification/SynModTree";
import {Describable} from "../../../../core/ui/api/Describable";
import {Icon} from "../../../../core/ui/icons/Icon";
import {UndoStack} from "../../../../editor/core/undo/UndoStack";

export class ApplicableIntent implements Describable {
    constructor(public readonly intent: IntentBase, public readonly node: SynNode) {
    }

    getIcon(): Icon | null {
        return this.intent.getIcon();
    }

    getDescription(): string {
        return this.intent.getDescription();
    }
}

/**
 *
 * @author Atzitz Amos
 * @date 9/23/2026
 * @since 1.0.0
 */
export class IntentsAnalysis {

    public static async executeIntent(editor: Editor, intent: ApplicableIntent) {
        const document = SynDocumentManager.getOpenedSynDocument(editor);
        const synMod = new SynModTree(document);
        await intent.intent.execute(editor.getPrimaryCaret(), intent.node, synMod);

        UndoStack.undoableAction(editor, "applyIndent", () => {
            for (const modification of synMod.getModifications()) {
                document.getDocument().replaceRange(modification.range, modification.text);
            }
        });
    }

    public static getApplicableIntentsAtCaret(editor: Editor) {
        const document = SynDocumentManager.getOpenedSynDocument(editor);
        const caret = editor.getPrimaryCaret();
        let element = document.getTree().getDeepestChildAt(caret.getOffset()) as SynNode | null;
        const result: ApplicableIntent[] = [];
        while (element) {
            for (const intent of IntentsRegistry.getForLanguage(document.getLanguage())) {
                if (intent.getTargetTypes().some(type => element instanceof type) && intent.isApplicable(caret, element)) {
                    result.push(new ApplicableIntent(intent, element));
                }

            }
            element = element.getParent()
        }
        return result;
    }
}
