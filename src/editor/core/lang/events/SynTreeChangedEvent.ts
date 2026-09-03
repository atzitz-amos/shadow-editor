import {EventSubscriber} from "../../../../core/events/EventSubscriber";
import {LanguageBase} from "../../../../lang/LanguageBase";
import {SynDocument} from "../../../../lang/syntax/api/document/SynDocument";
import {EventBase} from "../../../../core/events/EventBase";
import {BubbleDirection} from "../../../../core/events/BubbleDirection";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class SynTreeChangedEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    public constructor(private readonly document: SynDocument, private readonly language: LanguageBase) {
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }

    public getSynDocument(): SynDocument {
        return this.document;
    }

    public getLanguage(): LanguageBase {
        return this.language;
    }
}
