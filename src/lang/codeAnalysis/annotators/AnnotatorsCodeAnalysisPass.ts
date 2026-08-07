import {CodeAnalysisPass} from "../analysis/api/CodeAnalysisPass";
import {SynNodeVisitor} from "../../syntax/visitors/SynNodeVisitor";
import {HighlightHolder} from "../../../editor/ui/highlighter/HighlightHolder";
import {Editor} from "../../../editor/Editor";
import {SynDocument} from "../../syntax/api/document/SynDocument";
import {AnnotatorBase} from "./AnnotatorBase";

/**
 *
 * @author Atzitz Amos
 * @date 8/3/2026
 * @since 1.0.0
 */
export class AnnotatorsCodeAnalysisPass implements CodeAnalysisPass<HighlightHolder> {
    private readonly holder: HighlightHolder;

    constructor(private readonly document: SynDocument, private readonly annotators: AnnotatorBase[]) {
        this.holder = new HighlightHolder(document.getDocument(), 2, true);
    }


    getHolder(): HighlightHolder {
        return this.holder;
    }

    collectVisitors(): SynNodeVisitor[] {
        return this.annotators
            .filter(x => x.getApplicableLanguages().includes(this.document.getLanguage()))
            .map(x => x.buildVisitor(this.holder));
    }

    processResults(editor: Editor): void {
        editor.getOpenedDocument().setAnnotations(this.holder)
        editor.repaintView();
    }

    runOnlyOnVisibleNodes(): boolean {
        return true;
    }

}
