import {DebugToolTab} from "../DebugToolTab";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {GlobalState} from "../../../../core/global/GlobalState";
import {CaretMovedEvent} from "../../../../editor/core/caret/events/CaretMovedEvent";
import {Editor} from "../../../../editor/Editor";
import {EditorLanguageChanged} from "../../../../editor/core/lang/events/EditorLanguageChanged";
import {SpacingFormatter} from "../../../../lang/codeStyle/spacing/SpacingFormatter";
import {Scheduler} from "../../../../core/scheduler/Scheduler";
import {Spacing} from "../../../../lang/codeStyle/spacing/SpacingRule";
import {MainEditorChangedEvent} from "../../../../app/ui/events/MainEditorChangedEvent";
import {SynDocumentManager} from "../../../../lang/syntax/manager/SynDocumentManager";

/**
 *
 * @author Atzitz Amos
 * @date 8/29/2026
 * @since 1.0.0
 */
export class CodeStyleTab extends DebugToolTab {
    private element: HTMLElement | null = null;

    constructor() {
        super();

        this.init();
    }

    init() {
        GlobalState.getMainEventBus().subscribe(this, CaretMovedEvent.SUBSCRIBER, e => {
            if (this.isSelected) {
                this.update(e.getEditor());
            }
        });

        GlobalState.getMainEventBus().subscribe(this, EditorLanguageChanged.SUBSCRIBER, e => {
            if (this.isSelected) {
                this.update(e.getEditor());
            }
        });

        GlobalState.getMainEventBus().subscribe(this, MainEditorChangedEvent.SUBSCRIBER, e => {
            if (this.isSelected) {
                this.update(e.getNewEditor());
            }
        });
    }

    dispose() {
        GlobalState.getMainEventBus().unsubscribe(this, CaretMovedEvent.SUBSCRIBER);
        GlobalState.getMainEventBus().unsubscribe(this, EditorLanguageChanged.SUBSCRIBER);
    }

    getName(): string {
        return "codeStyle";
    }

    getTitle(): string {
        return "Code Style";
    }

    buildElement(): HTMLElement {
        return HTMLUtils.html(`
                <div class="file-info">
                    <div>Language: <span class="language-info"></span></div>
                    <div>Caret Offset: <span class="caret-offset"></span></div>
                </div>
                <div class="main-info">
                    <details class="formatting-blocks-info">
                        <summary>Formatting Blocks</summary>
                        <div></div>
                    </details>
                    <details class="spacing-rules-info">
                        <summary>Spacing Rules</summary>
                        <div></div>
                    </details>
                </div>
                <div class="no-formatter-message">
                    No formatter found
                </div>
            `, "debug-popup-inner code-style-inner");
    }

    getElement(): HTMLElement {
        if (!this.element) {
            this.element = this.buildElement();
        }

        const editor = GlobalState.getMainEditor();
        if (!editor) return HTMLUtils.html("No opened editor");

        this.update(editor);
        return this.element;
    }

    private update(editor: Editor | null) {
        if (!editor) {
            if (this.element?.parentElement) {
                this.element.parentElement.innerHTML = "No opened editor";
            }
            this.element = null;
            return;
        } else if (!this.element) {
            this.element = this.buildElement();
        }

        const language = editor.getCurrentLanguage();
        const formatter = language?.getSpacingFormatter();
        const offset = editor.getPrimaryCaret()?.getOffset();

        if (offset === undefined) return Scheduler.defer(() => this.update(editor));

        this.element!.querySelector(".file-info .language-info")!.textContent = language?.getDisplayName() ?? "Plain Text";
        this.element!.querySelector(".file-info .caret-offset")!.textContent = offset?.toString();

        if (!formatter) {
            this.element!.classList.add("no-formatter");
            return;
        } else {
            this.element!.classList.remove("no-formatter");
        }

        this.updateSpacingRules(editor, formatter, this.element!.querySelector(".main-info .spacing-rules-info > div")!);
    }

    private updateSpacingRules(editor: Editor, formatter: SpacingFormatter, element: Element) {
        const offset = editor.getPrimaryCaret().getOffset();
        const formattingInfo = formatter.collectFormattingInfo(
            editor.getOpenedDocument().getTokenCache().createTokenStream(),
            SynDocumentManager.getOpenedSynDocument(editor).getTree()).find(info => info.offset === offset);

        function getDecisionText(spacing: Spacing | null): string {
            switch (spacing) {
                case null:
                    return formattingInfo?.type === "default" ? "One space" : "-";
                case Spacing.NONE:
                    return "No space";
                case Spacing.ONE:
                    return "One space";
                case Spacing.KEEP:
                    return "Keep existing spacing";
                case Spacing.AT_LEAST_ONE:
                    return "At least one space";
            }
        }

        if (!formattingInfo) {
            element.innerHTML = "No spacing rule applied here"
        } else {
            const type = formattingInfo.type === "line-begin" ? "Ignored (line begin)" : formattingInfo.type === "default" ? "Ignored (default)" : "Spacing rule applied";
            const decision = getDecisionText(formattingInfo.decision);

            element.innerHTML = `
                <div>
                    <b>Type:</b> <span>${type}</span>
                </div>
                <div>
                    <b>Decision:</b> <span>${decision}</span>
                </div>
                <div>
                    <b>Applicable Rules:</b>
                    <ul>
                        ${formattingInfo.applicableRules
                .toSorted((a, b) => b.getPriority() - a.getPriority())
                .map(rule => `<li>${rule.getRuleName()} (Priority: ${rule.getPriority()})</li>`)
                .join("")}
                    </ul>
                </div>
            `;
        }
    }
}
