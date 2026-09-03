// ============================================================================
// 1. NAVIGATION TYPES & CONTAINER FRAMEWORK
// ============================================================================

import {UIComponent} from "../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../editor/utils/HTMLUtils";
import {NavPaneContainer} from "../../../core/ui/lib/nav/NavPaneContainer";
import {SynDocument} from "../../../lang/syntax/api/document/SynDocument";
import {ProjectFile} from "../../../core/project/filesystem/tree/ProjectFile";

export class SynSuiteWidget extends UIComponent {
    private synDocument: SynDocument | null = null;
    private navPane!: NavPaneContainer;
    private selectedPluginId: string | null = null;

    constructor() {
        super(HTMLUtils.createDiv("syn-suite-widget-container"));
    }

    draw(): void {
    }

    public getNavPane(): NavPaneContainer {
        return this.navPane;
    }

    public getActiveFile(): ProjectFile | null {
        return this.synDocument?.getAssociatedFile() ?? null;
    }

    public getSelectedPluginId(): string | null {
        return this.selectedPluginId;
    }

    public setSelectedPluginId(id: string | null): void {
        this.selectedPluginId = id;
    }

    public onSynTreeChanged(synDocument: SynDocument | null): void {
        this.synDocument = synDocument;
        this.redraw();
    }
}
