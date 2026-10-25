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
        this.init();
    }

    draw(): void {
        this.setInnerHTML("");
        this.init();
        this.drawChildren();
    }

    onSynTreeChanged(editor: Editor, synDocument: SynDocument): void {
        this.astViewerWidget.onSynTreeChanged(editor, synDocument);
    }

    onCaretMoved(offset: Offset): void {
        this.astViewerWidget.onCaretMoved(offset);
    }

    private init() {
        this.tabs = new TabPane();
        this.tabs.addTab("ast-viewer", "AST Viewer", this.astViewerWidget);
        this.tabs.addTab("syn-suite", "Syn Suite", this.synSuiteLauncher);

        this.addChild(this.tabs);
    }

}
