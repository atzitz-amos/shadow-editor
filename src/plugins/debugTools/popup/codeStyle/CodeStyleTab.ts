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
import {CodeStyleManager} from "../../../../lang/codeStyle/manager/CodeStyleManager";
import JsLang from "../../../jsLang/lang/JsLang";
import {DocumentModificationUtils} from "../../../../editor/core/document/utils/DocumentModificationUtils";
import {JsWhitespaceScrambler} from "./JsWhitespaceScrambler";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {EditorHighlighterUtils} from "../../../../editor/ui/highlighter/overlay/EditorHighlighterUtils";
import {TextAttributeKey} from "../../../../editor/ui/highlighter/style/TextAttributeKey";
import {TextBackground} from "../../../../editor/ui/highlighter/style/TextBackground";
import {FormattingBlock, FormattingIndent} from "../../../../lang/codeStyle/formatter/nodes/FormattingBlock";
import {FormattingNode} from "../../../../lang/codeStyle/formatter/nodes/FormattingNode";
import {FormattingSourceNewline} from "../../../../lang/codeStyle/formatter/nodes/FormattingSourceNewline";
import {FormattingSourceWhitespace} from "../../../../lang/codeStyle/formatter/nodes/FormattingSourceWhitespace";
import {FormattingSoftwrap} from "../../../../lang/codeStyle/formatter/nodes/FormattingSoftwrap";
import {FormattingBreak} from "../../../../lang/codeStyle/formatter/nodes/FormattingBreak";
import {FormattingText} from "../../../../lang/codeStyle/formatter/nodes/FormattingText";
import {DocumentModificationEvent} from "../../../../editor/core/document/events/DocumentModificationEvent";

/**
 *
 * @author Atzitz Amos
 * @date 8/29/2026
 * @since 1.0.0
 */
export class CodeStyleTab extends DebugToolTab {
    private static readonly TEXT_HIGHLIGHT_KEY = TextAttributeKey.of(new TextBackground("rgb(200 96 232 / 0.25)"))

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

        GlobalState.getMainEventBus().subscribe(this, DocumentModificationEvent.SUBSCRIBER, e => {
            if (this.isSelected) {
                this.update(e.getEditor());
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
                    <button class="ide-btn scramble-btn" primary>Scramble file</button>
                </div>
                <div class="main-info">
                    <details class="formatting-blocks-info">
                        <summary>Formatting Blocks</summary>
                        <div class="popup-tree"></div>
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
            this.setup();
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
            this.setup();
        }

        const language = editor.getCurrentLanguage();
        const formatter = CodeStyleManager.getInstance(language);
        const offset = editor.getPrimaryCaret()?.getOffset();

        if (offset === undefined) return Scheduler.defer(() => this.update(editor));

        this.element!.querySelector(".file-info .language-info")!.textContent = language?.getDisplayName() ?? "Plain Text";
        this.element!.querySelector(".file-info .caret-offset")!.textContent = offset?.toString();

        if (language === JsLang.INSTANCE) {
            (<HTMLElement>this.element!.querySelector(".file-info .scramble-btn")).style.display = "block";
        } else {
            (<HTMLElement>this.element!.querySelector(".file-info .scramble-btn")).style.display = "none";
        }

        if (!formatter) {
            this.element!.classList.add("no-formatter");
            return;
        } else {
            this.element!.classList.remove("no-formatter");
        }

        this.updateSpacingRules(editor, formatter.getSpacingFormatter(), this.element!.querySelector(".main-info .spacing-rules-info > div")!);
        this.updateFormattingBlocks(editor, formatter, this.element!.querySelector(".main-info .formatting-blocks-info > div")!);
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

    private setup() {
        (<HTMLElement>this.element!.querySelector(".file-info .scramble-btn")).addEventListener("click", () => {
            const editor = GlobalState.getMainEditor();
            DocumentModificationUtils.modifyWithCaret(editor.getOpenedDocument(), editor.getPrimaryCaret(), "scramble", () => {
                editor.getOpenedDocument().replaceRange(editor.getFullRange(), new JsWhitespaceScrambler().scramble(editor.getOpenedDocument().getTextContent()));
            });

            editor.repaintView();
        });
    }

    private buildFormattingNode(name: string, data?: string, range?: TextRange, parentEl?: HTMLElement) {
        const details = document.createElement("details");
        const summary = document.createElement("summary");

        const titleSpan = HTMLUtils.createElement("span.node-title");
        titleSpan.textContent = name;

        summary.appendChild(titleSpan);
        if (range && range.end) {
            titleSpan.addEventListener("mouseover", e => {
                EditorHighlighterUtils.highlight(
                    GlobalState.getMainEditor(),
                    "formatting-tree-viewer",
                    CodeStyleTab.TEXT_HIGHLIGHT_KEY,
                    null,
                    range
                )

            });

            titleSpan.addEventListener("mouseout", e => {
                EditorHighlighterUtils.clear(GlobalState.getMainEditor(), "ast-viewer");
            });
        }

        if (data) {
            const dataSpan = document.createElement("span");
            dataSpan.classList.add("node-data");
            dataSpan.innerHTML = data;
            summary.appendChild(dataSpan);
        }

        details.appendChild(summary);
        details.setAttribute("open", "true");

        if (parentEl)
            parentEl.appendChild(details);

        return details;
    }

    private updateFormattingBlocks(editor: Editor, manager: CodeStyleManager, element: Element) {
        const visitor = manager.getFormattingBlockVisitor();
        const block = visitor.format(SynDocumentManager.getOpenedSynDocument(editor).getTree(), editor.getOpenedDocument().getTokenCache().createTokenStream());

        element.innerHTML = "";
        this.buildFormattingTreeRecursive(block, element as HTMLElement).classList.add("popup-tree");
    }

    private buildFormattingTreeRecursive(block: FormattingBlock, element: HTMLElement) {
        function getDataForFormattingBlock(block: FormattingBlock) {
            let expanding = (() => {
                if (block.isNeverExpanding()) {
                    return "<span>NEVER_EXPAND</span>"
                } else if (block.isForceExpanding()) {
                    return "<span>FORCE_EXPAND</span>"
                } else {
                    return `<span>${block.isExpanded() ? 'EXPANDED' : 'COLLAPSED'}</span>`
                }
            })();
            if (block.keepBlankLines()) {
                expanding += " <span>KEEP_BLANK</span>"
            }
            if (block.getIndent() > 0) expanding += ` <span>${FormattingIndent[block.getIndent()]}</span>`
            return expanding;
        }

        const nodeElement = this.buildFormattingNode("FormattingBlock", getDataForFormattingBlock(block), block.getRange(), element);

        for (const child of block.getChildren()) {
            if (child instanceof FormattingBlock) {
                this.buildFormattingTreeRecursive(child, nodeElement);
            } else {
                this.buildFormattingLeaf(child, nodeElement);
            }
        }

        return nodeElement;
    }

    private buildFormattingLeaf(node: FormattingNode, element: HTMLElement) {
        let nodeElement: HTMLElement;

        if (node instanceof FormattingSourceNewline) {
            nodeElement = this.buildFormattingNode("FormattingSourceNewline", `"\\n"`, node.getNewlineToken().getRange(), element);
            nodeElement.classList.add("leaf-node", "source-node");
        } else if (node instanceof FormattingSourceWhitespace) {
            let data = `"${node.getWhitespaceToken()?.getValue() ?? ''}"`;
            if (node.isIndentationWhitespace()) {
                data += " INDENT";
            }
            nodeElement = this.buildFormattingNode("FormattingSourceWhitespace", data, node.getWhitespaceToken()?.getRange(), element);
            nodeElement.classList.add("leaf-node", "source-node");
        } else if (node instanceof FormattingText) {
            nodeElement = this.buildFormattingNode("FormattingText", `"${node.getToken().getValue()}"`, node.getToken().getRange(), element);
            nodeElement.classList.add("leaf-node", "text-node");
        } else if (node instanceof FormattingSoftwrap) {

        } else if (node instanceof FormattingBreak) {
            nodeElement = this.buildFormattingNode("FormattingBreak", `replaceWith="${node.getReplacementString()}"`, undefined, element);
            nodeElement.classList.add("leaf-node", "break-node");
        }
    }
}
