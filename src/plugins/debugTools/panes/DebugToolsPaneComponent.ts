import {UIPaneComponent} from "../../../app/core/panes/ui/UIPaneComponent";
import {IPane} from "../../../app/core/panes/pane/IPane";
import {ASTViewerWidget} from "./ASTViewerWidget";
import {TabPane} from "../../../core/ui/lib/tabs/TabPane";
import {SynSuiteWidget} from "./SynSuiteWidget";
import {SynFile} from "../../../core/lang/syntax/api/SynFile";
import {Editor} from "../../../editor/Editor";

/**
 *
 * @author Atzitz Amos
 * @date 6/4/2026
 * @since 1.0.0
 */
export class DebugToolsPaneComponent extends UIPaneComponent {
    private tabs: TabPane;
    private readonly astViewerWidget: ASTViewerWidget;
    private readonly synSuiteWidget: SynSuiteWidget;

    constructor(pane: IPane) {
        super(pane);

        this.astViewerWidget = new ASTViewerWidget();
        this.synSuiteWidget = new SynSuiteWidget();
        this.init();
    }

    draw(): void {
        this.setInnerHTML("");
        this.init();
        this.drawChildren();
    }

    onSynTreeChanged(editor: Editor, synFile: SynFile): void {
        this.astViewerWidget.onSynTreeChanged(editor, synFile);
        this.synSuiteWidget.onSynTreeChanged(synFile);
    }

    onCaretMoved(offset: Offset): void {
        this.astViewerWidget.onCaretMoved(offset);
    }

    private init() {
        this.tabs = new TabPane();
        this.tabs.addTab("ast-viewer", "AST Viewer", this.astViewerWidget);
        this.tabs.addTab("syn-suite", "Syn Suite", this.synSuiteWidget);

        this.addChild(this.tabs);
    }

}
