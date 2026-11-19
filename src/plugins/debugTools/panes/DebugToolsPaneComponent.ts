import {UIPaneComponent} from "../../../app/core/panes/ui/UIPaneComponent";
import {IPane} from "../../../app/core/panes/pane/IPane";
import {ASTViewerWidget} from "./ASTViewerWidget";
import {TabPane} from "../../../core/ui/lib/tabs/TabPane";
import {SynSuiteLauncher} from "./SynSuiteLauncher";
import {Editor} from "../../../editor/Editor";
import {SynDocument} from "../../../lang/syntax/api/document/SynDocument";

/**
 *
 * @author Atzitz Amos
 * @date 6/4/2026
 * @since 1.0.0
 */
export class DebugToolsPaneComponent extends UIPaneComponent {
    private tabs: TabPane;
    private readonly astViewerWidget: ASTViewerWidget;
    private readonly synSuiteLauncher: SynSuiteLauncher;

    constructor(pane: IPane) {
        super(pane);

        this.astViewerWidget = new ASTViewerWidget();
        this.synSuiteLauncher = new SynSuiteLauncher();
        this.tabs = this.createTabs();
    }

    draw(): void {
        // Hiding the pane disposes its content, which is created again when it is shown. Otherwise the tabs are kept:
        // recreating them on every draw would draw the widgets they hold again
        if (this.tabs.isDisposed()) this.tabs = this.createTabs();
        this.drawChildren();
    }

    onSynTreeChanged(editor: Editor, synDocument: SynDocument): void {
        this.astViewerWidget.onSynTreeChanged(editor, synDocument);
    }

    onCaretMoved(offset: Offset): void {
        this.astViewerWidget.onCaretMoved(offset);
    }

    private createTabs(): TabPane {
        const tabs = new TabPane();
        tabs.addTab("ast-viewer", "AST Viewer", this.astViewerWidget);
        tabs.addTab("syn-suite", "Syn Suite", this.synSuiteLauncher);
        this.addChild(tabs);
        return tabs;
    }
}
