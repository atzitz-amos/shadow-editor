import {Editor} from "../../../../editor/Editor";
import {SynNodeVisitor} from "../../../syntax/visitors/SynNodeVisitor";
import {CodeAnalysisPass} from "../../analysis/api/CodeAnalysisPass";
import {IntentsHolder} from "../holder/IntentsHolder";
import {SynDocument} from "../../../syntax/api/document/SynDocument";
import {IntentBase} from "../IntentBase";


/**
 *
 * @author Atzitz Amos
 * @date 8/30/2026
 * @since 1.0.0
 */
export class IntentsCodeAnalysisPass implements CodeAnalysisPass<IntentsHolder> {
    private readonly holder: IntentsHolder;

    constructor(private readonly document: SynDocument, private readonly intents: IntentBase[]) {
        this.holder = new IntentsHolder(document);
    }

    collectVisitors(): SynNodeVisitor[] {
        return this.intents
            .filter(x => x.getApplicableLanguage().includes(this.document.getLanguage()))
            .map(x => x.buildVisitor(this.holder));
    }

    processResults(editor: Editor): void {

    }

    getHolder(): IntentsHolder {
        throw new Error("Method not implemented.");
    }

    runOnlyOnVisibleNodes(): boolean {
        return true;
    }

    getPriority(): number {
        return 3;
    }
}
