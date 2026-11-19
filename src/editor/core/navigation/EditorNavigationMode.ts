import {EditorModeEx} from "../behaviors/mode/EditorModeEx";
import {EditorURI} from "../../../core/navigation/uri/EditorURI";
import {EditorBehavior} from "../behaviors/EditorBehavior";
import {EnterPressedBehavior} from "../behaviors/behavior/EnterPressedBehavior";
import {ModifierKeyHolder} from "../../../core/keybinds/Keybind";
import {BehaviorHandlingMode} from "../behaviors/manager/BehaviorHandlingMode";
import {TabPressedBehavior} from "../behaviors/behavior/TabPressedBehavior";
import {URINavigationManager} from "../../../core/navigation/URINavigationManager";
import {NavigationSnapshot} from "../../../app/core/tabs/NavigationSnapshot";
import {Editor} from "../../Editor";
import {Logger} from "../../../core/logging/logger/LoggerCore";
import {ICustomHighlighter} from "../../../lang/highlighter/custom/ICustomHighlighter";
import {FocusedModeHighlighter} from "../../../lang/highlighter/custom/FocusedModeHighlighter";
import {ScrollMode} from "../../ui/scrollbar/Scrolling";

interface EditorNavigationModeOptions {
    ctrlEnterDoes: 'next' | 'nothing';
    tabDoes: 'next' | 'nothing';
    escDoes: 'exit' | 'nothing';
    exit: 'stays' | 'restore' | 'restore-keep-open';
    onceFinished: 'cycle' | 'quit';
    useFocusedHighlighting: boolean;
}

/**
 *
 * @author Atzitz Amos
 * @date 11/17/2026
 * @since 1.0.0
 */
export class EditorNavigationMode extends EditorModeEx {
    private static readonly logger: Logger = Logger.for("EditorNavigationMode");

    private editor: Editor | null = null;

    private currentIndex: number = -1;

    private snapshot: NavigationSnapshot | null = null;

    constructor(private readonly uris: EditorURI[], private readonly options: EditorNavigationModeOptions) {
        super();

        if (this.uris.length === 0) {
            throw new Error("EditorNavigationMode requires at least one URI to navigate.");
        }
    }

    getEnterPressedBehavior(): EditorBehavior {
        return EnterPressedBehavior.wrapping(this, ctx => {
            if (ModifierKeyHolder.isCtrlPressed() && this.options.ctrlEnterDoes === 'next') {
                if (ModifierKeyHolder.isShiftPressed()) this.previous();
                else this.next();
                return BehaviorHandlingMode.HANDLED;
            }
            return BehaviorHandlingMode.FORWARD;
        })
    }

    getTabPressedBehavior(): EditorBehavior {
        return TabPressedBehavior.wrapping(this, ctx => {
            if (this.options.tabDoes === 'next') {
                this.next();
                return BehaviorHandlingMode.HANDLED;
            }
            return BehaviorHandlingMode.FORWARD;
        });
    }

    getDisplayName(): string {
        return "Navigate";
    }

    escapeWillExit(): boolean {
        return this.options.escDoes === 'exit';
    }

    onEnter(editor: Editor) {
        this.snapshot ??= NavigationSnapshot.capture();
        this.editor = editor;
        this.next();
    }

    onExit(editor: Editor) {
        // A mode entered on top of this one: the navigation goes on
        if (editor.getBehaviorManager().hasMode(this)) return;

        const snapshot = this.snapshot;
        this.snapshot = null;
        if (!snapshot) return;

        if (this.options.exit === 'stays') {
            snapshot.dispose();
            return;
        }
        // After the mode change completes, as restoring switches the document of the editor
        queueMicrotask(() => snapshot.restore({closeOpened: this.options.exit === 'restore'})
            .catch(e => EditorNavigationMode.logger.error("Could not restore the state from before the navigation", e))
            .finally(() => snapshot.dispose()));
    }

    getCustomHighlighter(): ICustomHighlighter | null {
        const selected = this.uris[this.currentIndex].getSelectedRegion();
        if (selected && this.options.useFocusedHighlighting) {
            return new FocusedModeHighlighter(selected);
        }
        return null;
    }

    async next() {
        this.currentIndex++;
        if (this.currentIndex >= this.uris.length) {
            if (this.options.onceFinished === 'cycle') {
                this.currentIndex = 0;
            } else {
                return this.exit();
            }
        }

        await this.update();
    }

    async previous() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            if (this.options.onceFinished === 'cycle') {
                this.currentIndex = this.uris.length - 1;
            } else {
                return this.exit();
            }
        }

        await this.update();
    }

    private exit() {
        if (!this.editor || this.editor.getBehaviorManager().getCurrentMode() != this) return;
        this.editor.getBehaviorManager().exitMode();
    }

    private async update() {
        const uri = this.uris[this.currentIndex];
        const previous = this.editor?.getOpenedDocument();

        await URINavigationManager.navigateAsync(uri);

        const selected = this.uris[this.currentIndex].getSelectedRegion();
        if (selected)
            this.editor?.getView().ensureRangeVisible(selected, 2, previous === this.editor.getOpenedDocument() ? ScrollMode.Smooth : ScrollMode.Instant);

    }
}
