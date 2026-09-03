import {IntentBase} from "../IntentBase";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {SynDocument} from "../../../syntax/api/document/SynDocument";

export interface IntentBaseDescriptor {
    indent: IntentBase,
    range: TextRange,
    effect: () => void
}

/**
 *
 * @author Atzitz Amos
 * @date 8/30/2026
 * @since 1.0.0
 */
export class IntentsHolder {
    private readonly intents: IntentBaseDescriptor[] = []

    constructor(private readonly document: SynDocument) {
    }

    getDocument(): SynDocument {
        return this.document;
    }

    getIntentsAt(offset: Offset) {
        return this.intents.filter(x => x.range.contains(offset));
    }

    getAllIntents() {
        return this.intents
    }

    addIntent(range: TextRange, intent: IntentBase, effect: () => void) {
        this.intents.push({indent: intent, range: range, effect: effect});
    }
}
