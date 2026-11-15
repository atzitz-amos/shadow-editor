import {Document} from "../../../editor/core/document/Document";
import {CodeCompletionSession} from "../session/CodeCompletionSession";
import {CompletionTriggerManager} from "../session/trigger/CompletionTriggerManager";
import {TextRange} from "../../../editor/core/coordinate/range/TextRange";
import {CodeCompletionProvidersRegistry} from "../session/provider/CodeCompletionProvidersRegistry";
import {SynDocumentManager} from "../../syntax/manager/SynDocumentManager";
import {Editor} from "../../../editor/Editor";
import {OffsetAttachedPopupFrame} from "../../../editor/ui/popups/builder/OffsetAttachedPopupFrame";
import {Service} from "../../../core/threaded/service/Service";
import {GlobalState} from "../../../core/global/GlobalState";
import {KeyPressedEvent} from "../../../editor/impl/events/PhysicalEvents";
import {CodeCompletionItem} from "../item/CodeCompletionItem";
import {SynModTree} from "../../codeGen/modification/SynModTree";
import {DocumentModificationUtils} from "../../../editor/core/document/utils/DocumentModificationUtils";
import {CompletionInfo, CompletionUtils} from "./CompletionUtils";
import {SynPlaceholder} from "../../codeGen/placeholder/SynPlaceholder";
import {CaretMovedEvent} from "../../../editor/core/caret/events/CaretMovedEvent";
import {CaretMovementFlags} from "../../../editor/core/caret/Caret";
import {EditorScrolledEvent} from "../../../editor/impl/events/EditorScrolledEvent";
import {CloseOn} from "../../../core/ui/api/Closeable";
import {CCRanker} from "../ranking/CCRanker";
import {SimpleCCSpecificityRanker} from "../ranking/SimpleCCSpecificityRanker";
import {AutocompletePopupBuilder} from "../../../editor/ui/popups/autocomplete/AutocompletePopupBuilder";
import {AutocompletePopup} from "../../../editor/ui/popups/autocomplete/AutocompletePopup";

/**
 * Owns the one completion session of the application, and its popup.
 * <p>
 * The session can outlive the popup: when nothing matches the prefix anymore the popup closes, but the session
 * stays so that a backspace brings the completions back without asking the providers again. The opposite never
 * happens: a popup that closes by itself (click outside, focus lost) ends the session.
 *
 * @author Atzitz Amos
 * @date 10/25/2026
 * @since 1.0.0
 */
@Service
export class CompletionManager {
    private static readonly instance = new CompletionManager();

    private session: CodeCompletionSession | null = null;
    private currEditor: Editor | null = null;

    private applying: boolean = false;

    private popup: OffsetAttachedPopupFrame | null = null;

    private ranker: CCRanker = SimpleCCSpecificityRanker.DEFAULT_RANKER;

    public static getInstance(): CompletionManager {
        return this.instance;
    }

    public begin(): void {
        const bus = GlobalState.getMainEventBus();

        bus.subscribe(this, KeyPressedEvent.SUBSCRIBER, e => this.onKeyPressed(e));

        bus.subscribe(this, CaretMovedEvent.SUBSCRIBER, e => {
            // Applying a completion moves the caret itself
            if (this.applying || !this.session || e.getEditor() !== this.currEditor) return;
            if (e.getCaret() !== this.currEditor.getPrimaryCaret()) return;

            // Typing moves the caret too, but never out of the prefix
            if (!this.session.containsOffset(e.getCaret().getOffset())) this.cancelAutoComplete();
        });

        bus.subscribe(this, EditorScrolledEvent.SUBSCRIBER, e => {
            if (e.getEditor() === this.currEditor) this.popup?.reposition();
        });
    }

    /**
     * Update the completions after an edit at `offset`
     * */
    updateAutoComplete(editor: Editor, document: Document, offset: Offset, insertedText: string, deletedText: string) {
        if (this.applying) return;

        if (this.currEditor === editor && this.session?.isSessionStillValid(offset, insertedText, deletedText)) {
            this.updateCompletions(editor);
            return;
        }

        // A deletion must not open a session on an empty prefix: that would bring right back the popup that
        // deleting the prefix just closed.
        this.startSession(editor, document, offset + insertedText.length, false, deletedText.length > 0);
    }

    /**
     * Start a new auto complete session at `offset` on the user's request, replacing the current one if any.
     * Unlike a session that opens by itself while typing, it stays open when its prefix is deleted.
     */
    openAutoComplete(editor: Editor, document: Document, offset: Offset) {
        if (this.applying) return;

        this.startSession(editor, document, offset, true, false);
    }

    /**
     * Cancel the current auto complete session
     */
    cancelAutoComplete() {
        this.session?.dispose();
        this.session = null;
        this.closePopup();
    }

    hasAutocompleteSession() {
        return this.session !== null;
    }

    /**
     * Whether a completion is being applied. The edits it makes are not the user typing, and must neither
     * update nor cancel the session.
     */
    isApplying(): boolean {
        return this.applying;
    }

    private startSession(editor: Editor, document: Document, offset: Offset, manual: boolean, requirePrefix: boolean) {
        this.cancelAutoComplete();
        this.currEditor = editor;

        if (document.getLanguage()) this.tryAutoComplete(editor, document, offset, manual, requirePrefix);
    }

    private onKeyPressed(e: KeyPressedEvent) {
        if (!this.session || e.getEditor() !== this.currEditor) return;

        if (e.getEvent().key === "Escape") {
            this.cancelAutoComplete();
            e.cancel();
            return;
        }

        // Without a popup there is nothing to navigate or accept: the key belongs to the editor
        const list = this.getPopup()?.getList();
        if (!list) return;

        switch (e.getEvent().key) {
            case "ArrowUp":
            case "ArrowDown":
                list.onKeyDown(e.getEvent());
                break;
            case "Enter":
                this.accept(list.getValue(), false);
                break;
            case "Tab":
                this.accept(list.getValue(), true);
                break;
            default:
                return;
        }

        // cancel() only skips the editor's keybinds: the browser's own handling of the key (Tab moving the
        // focus out of the editor) has to be prevented separately.
        e.getEvent().preventDefault();
        e.cancel();
    }

    private getPopup(): AutocompletePopup | null {
        const popup = this.popup?.getPopup();
        return popup instanceof AutocompletePopup ? popup : null;
    }

    /**
     * Closes the popup without ending the session.
     */
    private closePopup() {
        const popup = this.popup;
        // Cleared first, so that the popup's close callback can tell this from the popup closing by itself
        this.popup = null;
        popup?.dispose();
    }

    /**
     * Try to start a new auto complete session at `offset`
     */
    private tryAutoComplete(editor: Editor, document: Document, offset: Offset, manual: boolean, requirePrefix: boolean) {
        const triggerHandler = CompletionTriggerManager.getTriggerHandler(document.getLanguage()!);
        if (!triggerHandler || !triggerHandler.isCompletionAllowedAt(document, offset)) return;

        const prefix: TextRange = triggerHandler.findCompletionPrefix(document, offset);
        if (prefix.getLength() === 0 && (requirePrefix || !triggerHandler.canStartCompletionBefore(document, offset))) return;

        this.session = new CodeCompletionSession(document, prefix, ch => triggerHandler.isIdentifier(ch), manual);
        this.provideCompletions(editor, document, offset);
    }

    private provideCompletions(editor: Editor, document: Document, offset: Offset) {
        const lang = document.getLanguage();
        if (!this.session || !lang) return;

        const providers = CodeCompletionProvidersRegistry.getCompletionProviders(lang);
        const synDocument = SynDocumentManager.getSynDocument(document);

        // The last parse did not commit (it timed out): the tree describes an older text, and its offsets are off
        const completionInfo = synDocument.getModificationTimestamp() === document.getModificationTimestamp()
            ? CompletionUtils.getCompletionInfo(offset, synDocument, this.session.getPrefixStart())
            : null;

        if (!completionInfo) {
            this.cancelAutoComplete();
            return;
        }

        this.session.setCompletionInfo(completionInfo);

        for (const provider of providers) {
            if (provider.isApplicable(completionInfo.node, completionInfo.token, completionInfo.text))
                this.session.addCompletions(
                    provider.getCompletionItems(
                        completionInfo.node,
                        completionInfo.token,
                        completionInfo.text
                    )
                )
        }

        this.updateCompletions(editor);
    }

    /**
     * Shows the completions that are applicable to the current prefix, in the popup if there is one
     */
    private updateCompletions(editor: Editor) {
        let info: CompletionInfo | null;
        if (!this.session || !(info = this.session.getCompletionInfo())) return;

        const completions = this.ranker.sort(this.session.getApplicableCompletions(), info.node);
        if (!completions.length) {
            this.closePopup();
            return;
        }

        const content = this.getPopup();
        if (this.popup && content) {
            // In place, so that the popup doesn't flicker and the selection survives typing
            content.setElements(completions);
            this.popup.moveToOffset(this.session.getPrefixStart());
            return;
        }

        this.closePopup();

        const builder = new AutocompletePopupBuilder(completions)
            // The focus stays in the editor, which forwards the keys of the list: see onKeyPressed
            .setAcceptCallback(selected => this.accept(selected, false));

        const popup: OffsetAttachedPopupFrame = new OffsetAttachedPopupFrame(editor, builder)
            .captureFocus(false)
            .closeOn(CloseOn.ESCAPE | CloseOn.BLUR)
            .onClosed(() => {
                // The popup closed by itself (click outside, focus lost, ...) and not through closePopup
                if (this.popup === popup) {
                    this.popup = null;
                    this.cancelAutoComplete();
                }
            });

        this.popup = popup;
        // Anchored at the start of the prefix, so that the popup doesn't move while typing
        popup.attachToOffset(this.session.getPrefixStart());
    }

    private accept(selected: CodeCompletionItem | null, replaceWholeIdentifier: boolean) {
        const editor = this.currEditor;
        const session = this.session;
        if (!selected || !editor || !session || this.applying) return;

        // Set for the whole apply: each modification fires a delete event and then an insert event, and the
        // caret moves, none of which may reach the session. Reset in the finally, as a completion that throws
        // would otherwise disable completion for good.
        this.applying = true;
        try {
            this.applyCompletion(editor, session, selected, replaceWholeIdentifier);
        } finally {
            this.applying = false;
            this.cancelAutoComplete();
        }
    }

    private applyCompletion(editor: Editor, session: CodeCompletionSession, selected: CodeCompletionItem, replaceWholeIdentifier: boolean) {
        const document = session.getDocument();
        const tree = SynDocumentManager.getSynDocument(document).getTree();
        const range = session.getReplacementRange(replaceWholeIdentifier);

        // The node being replaced: the identifier starting at the range, or whatever is before an empty one
        const replaced = tree.getDeepestChildAt(range.start, range.getLength() > 0 ? 'right' : 'left');
        const parent = CompletionUtils.getParentOrToplevel(tree, replaced);

        const synMod = new SynModTree(tree);
        selected.apply(parent, new SynPlaceholder(range), synMod);

        const inserted = document.createTracked(range.start, range.end, true, true);
        const caret = editor.getPrimaryCaret();

        DocumentModificationUtils.modifyWithCaret(document, caret, "applyCompletion", () => {
            for (const mod of synMod.getModifications()) {
                document.replaceRange(mod.range, mod.text);
            }
        });

        const caretOffset = selected.getCaretOffsetAfterApply();
        if (caretOffset !== null && inserted.isValid()) {
            const target = Math.min(inserted.start + Math.max(0, caretOffset), inserted.end);
            caret.moveToOffset(target, CaretMovementFlags.JUMP);
            DocumentModificationUtils.resetSelectionAnchor(caret);
        }
        inserted.invalidate();
    }
}
