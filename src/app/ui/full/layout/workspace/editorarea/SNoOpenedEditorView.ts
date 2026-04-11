import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";

/**
 *
 * @author Atzitz Amos
 * @date 4/10/2026
 * @since 1.0.0
 */
export class SNoOpenedEditorView extends UIComponent {
    constructor() {
        super(HTMLUtils.createDiv("no-opened-editor-view"));
    }

    public draw(): void {
        this.setInnerHTML(`
            <div class="no-opened-editor-body">
                <div class="no-opened-editor-header">
                    <i class="fa-regular fa-file"></i>
                </div>
                <div style="font-size: 18px; font-weight: 600; color: #e3e6f0; margin-bottom: 8px;">No currently opened tab</div>
                <div style="font-size: 13px; line-height: 1.5; color: #8b92a3;">
                    Open a file from the workspace list to begin editing, or use
                    <strong style="color: #c7d2ff; font-weight: 600;">Ctrl+P</strong> to quickly jump to a file.
                </div>
            </div>`);
    }
}
