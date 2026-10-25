import {SynTreeChangedEvent} from "../../events/SynTreeChangedEvent";
import {Scheduler} from "../../../core/scheduler/Scheduler";
import {SynDocumentUtils} from "../../syntax/utils/SynDocumentUtils";
import {Editor} from "../../../editor/Editor";
import {GlobalState} from "../../../core/global/GlobalState";
import {SynEditorTreeChangedEvent} from "../../../editor/core/lang/events/SynEditorTreeChangedEvent";
import {SynDocumentManager} from "../../syntax/manager/SynDocumentManager";
import {SynDocument} from "../../syntax/api/document/SynDocument";
import {LanguageParserDefinition} from "../../definitions/LanguageParserDefinition";
import {CodeAnalysisManager} from "../../syntax/manager/CodeAnalysisManager";

/**
 *
 * @author Atzitz Amos
 * @date 8/3/2026
 * @since 1.0.0
 */
export class CodeAnalysisService {
    constructor(private readonly editor: Editor) {
        GlobalState.getMainEventBus().subscribe(this, SynTreeChangedEvent.SUBSCRIBER, e => {
            if (e.getSynDocument().getDocument() == editor.getOpenedDocument()) {
                this.onSynTreeChanged(e);
                editor.getEventBus().asyncPublish(new SynEditorTreeChangedEvent(editor, e.getSynDocument()));
            }
        });
    }

    restart() {
        if (!this.editor.getCurrentLanguage() || !LanguageParserDefinition.has(this.editor.getCurrentLanguage())) return;
        const synDocument = SynDocumentManager.getOpenedSynDocument(this.editor);

        this.getManager().forceRunCodeAnalysis(synDocument);
        this.update(synDocument);
    }

    private getManager(): CodeAnalysisManager {
        return CodeAnalysisManager.getInstance();
    }

    private onSynTreeChanged(event: SynTreeChangedEvent) {
        Scheduler.debounce(() => {
            this.update(event.getSynDocument());
        }, 100 * SynDocumentUtils.getDocumentLengthTier(event.getSynDocument().getDocument()), this.editor.getId());
    }


    private update(synDocument: SynDocument) {
        const holder = this.getManager().ensureUpToDate(synDocument);
        holder.applyAll(this.editor);
    }
}
