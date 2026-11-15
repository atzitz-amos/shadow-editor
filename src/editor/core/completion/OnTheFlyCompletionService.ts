import {Service} from "../../../core/threaded/service/Service";
import {GlobalState} from "../../../core/global/GlobalState";
import {DocumentModificationEvent} from "../document/events/DocumentModificationEvent";
import {CompletionManager} from "../../../lang/codeCompletion/manager/CompletionManager";
import {CompletionTriggerManager} from "../../../lang/codeCompletion/session/trigger/CompletionTriggerManager";
import {UndoStack} from "../undo/UndoStack";
import {Document} from "../document/Document";
import {Editor} from "../../Editor";
import {EditorKeyContextManager} from "../keycontext/EditorKeyContextManager";

/**
 * Opens, updates and cancels the completion session as the user types.
 *
 * @author Atzitz Amos
 * @date 10/25/2026
 * @since 1.0.0
 */
@Service
export class OnTheFlyCompletionService {
    private static readonly instance = new OnTheFlyCompletionService();

    public static getInstance(): OnTheFlyCompletionService {
        return this.instance;
    }

    public begin(): void {
        GlobalState.getMainEventBus().subscribe(this, DocumentModificationEvent.SUBSCRIBER, event => {
            const manager = CompletionManager.getInstance();
            // The edits of a completion being applied are not the user typing
            if (manager.isApplying()) return;

            const document = event.getDocument();
            const editor = this.findEditorTypingIn(document);
            if (!editor) return;

            const language = document.getLanguage();
            const triggerHandler = language ? CompletionTriggerManager.getTriggerHandler(language) : null;
            if (!triggerHandler || UndoStack.undoing) {
                manager.cancelAutoComplete();
                return;
            }

            const text = event.getInsertedText();
            const deletedText = event.getDeletedText();

            // A trigger character is not part of an identifier: it ends the session, and opens a new one after it
            const validInsert = text.length === 0
                || (text.length === 1 && (triggerHandler.isIdentifier(text) || triggerHandler.isTriggerCharacter(text)));
            // A deletion never opens a session, it can only keep one alive
            const validDelete = deletedText.length === 0 || (manager.hasAutocompleteSession() && deletedText.length === 1);

            if (validInsert && validDelete) {
                manager.updateAutoComplete(editor, document, event.getOffset(), text, deletedText);
            } else
                manager.cancelAutoComplete();
        });
    }

    /**
     * The editor the user is typing in when `document` is modified: the one with the keyboard focus, whichever
     * it is, and else the main one. Null if neither shows `document`.
     */
    private findEditorTypingIn(document: Document): Editor | null {
        const focused = EditorKeyContextManager.getCurrentEditor();
        if (focused && focused.getOpenedDocument() === document) return focused;

        const main = GlobalState.getMainEditor();
        if (main && main.getOpenedDocument() === document) return main;

        return null;
    }
}
