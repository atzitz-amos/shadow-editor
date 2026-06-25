import {AbstractAction} from "../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {KeybindContextDescriptor} from "../../../core/keybinds/context/KeybindContextDescriptor";
import {Key} from "../../../core/keybinds/Keybind";
import {GlobalState} from "../../../core/global/GlobalState";
import {CodeProblem} from "../../../core/lang/inspections/problems/CodeProblem";
import {SynModificationTree} from "../../../core/lang/syntax/tree/SynModificationTree";

/**
 *
 * @author Atzitz Amos
 * @date 6/7/2026
 * @since 1.0.0
 */
export class ApplyQuickFixAction extends AbstractAction {
    name = "ApplyQuickFix";

    description = "Applies the selected quick fix to the code.";

    keybindContext = KeybindContextDescriptor.IN_MAIN_EDITOR;

    defaultKeybinding = {
        key: Key.ENTER,
        ctrl: false,
        alt: true,
        shift: false
    }


    run(ctx: KeybindContext): void {
        const editor = ctx.requireEditor();

        const problems = GlobalState.getAnnotatorService().getProblems();
        const currentCaret = editor.getPrimaryCaret().getOffset();

        let selectedProblem: CodeProblem | null = null;
        for (const problem of problems) {
            if (problem.getRange().contains(currentCaret)) {
                if (selectedProblem !== null) {
                    // Multiple problems at the same location, we choose the one with the smallest range
                    if (problem.getRange().getLength() < selectedProblem.getRange().getLength()) {
                        selectedProblem = problem;
                    }
                } else {
                    selectedProblem = problem;
                }
            }
        }

        const quickFix = selectedProblem?.getQuickFixes()[0];
        if (quickFix) {
            const replacement = new SynModificationTree(editor.getCurrentLanguage()!, editor.getLangService().getSynFile(), editor.getOpenedDocument().getTextContent());
            quickFix.applyFix(selectedProblem!.getNode(), replacement);
            const mod = replacement.applyModifications();
            editor.replaceRange(editor.getFullRange(), mod.newText);
        }
    }

}
