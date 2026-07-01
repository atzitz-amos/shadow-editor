// ============================================================================
// 1. NAVIGATION TYPES & CONTAINER FRAMEWORK
// ============================================================================

import {UIComponent} from "../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../editor/utils/HTMLUtils";
import {SynSuiteEngine} from "../../../core/lang/suite/SynSuiteEngine";
import {SynAutomatedTestResult} from "../../../core/lang/suite/SynAutomatedTestResult";
import {NavPaneContainer} from "../../../core/ui/lib/menu/NavPaneContainer";
import {PopupUtilsCore} from "../../../core/ui/lib/popup/PopupUtilsCore";
import {SynDocument} from "../../../core/lang/syntax/api/document/SynDocument";

export class SynSuiteWidget extends UIComponent {
    private synDocument: any | null = null;
    private navPane!: NavPaneContainer;
    private selectedPluginId: string | null = null;

    constructor() {
        super(HTMLUtils.createDiv("syn-suite-widget-container"));
    }

    draw(): void {
        this.setInnerHTML(`
           <div class="syn-suite-body-viewport" style="flex: 1; height: calc(100% - 40px);"></div>
        `);

        const viewport = this.getUnderlyingElement().querySelector(".syn-suite-body-viewport") as HTMLElement;
        this.navPane = new NavPaneContainer(viewport);
        this.addChild(this.navPane);

        const dashboard = new SynSuiteDashboardView(this);
        this.navPane.setRootPane("Plugins Root", dashboard);
        this.navPane.draw();
    }

    public getNavPane(): NavPaneContainer {
        return this.navPane;
    }

    public getActiveFile(): any | null {
        return this.synDocument?.getAssociatedFile();
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

// ============================================================================
// 3. SYN SUITE DASHBOARD VIEW (LANDING LAYER)
// ============================================================================

export class SynSuiteDashboardView extends UIComponent {
    constructor(private controller: SynSuiteWidget) {
        super(HTMLUtils.createDiv("syn-suite-main-scroll"));
    }

    draw(): void {
        this.setInnerHTML("");

        // 1. Snapshot Capture Trigger Controls
        const activeFile = this.controller.getActiveFile();
        if (activeFile) {
            const snapContainer = HTMLUtils.createElement<HTMLDivElement>("div.syn-snap-box", this.getUnderlyingElement());
            snapContainer.style.marginBottom = "12px";

            // Using a structural dot modifier so your loop assigns the custom element correctly
            const snapBtn = document.createElement("ide-button") as HTMLElement;
            snapBtn.className = "syn-suite-snapshot";
            snapBtn.innerText = "Snapshot current file";
            snapContainer.appendChild(snapBtn);

            snapBtn.addEventListener("click", async () => {
                const testKey = await PopupUtilsCore.askString("Enter a unique test key for this snapshot", "Key");
                if (!testKey) return;

                const description = await PopupUtilsCore.askString("Enter a description for this snapshot", "Description");
                if (!description) return;

                const activePlugin = this.controller.getSelectedPluginId() ?? "default-plugin";
                SynSuiteEngine.getInstance().snapshot(testKey, activePlugin, "Manual editor workspace state save");
                this.redraw();
            });
        }

        // 2. Render Stored Plugin Matrix Groups
        const listContainer = HTMLUtils.createElement<HTMLDivElement>("div.syn-plugin-list", this.getUnderlyingElement());
        const engine = SynSuiteEngine.getInstance();
        const allTestsMap = engine.getAllTests();

        allTestsMap.forEach((tests, pluginId) => {
            const row = HTMLUtils.createElement<HTMLDivElement>("div.syn-plugin-row", listContainer);
            row.innerHTML = `
                <div class="syn-plugin-meta">
                    <span class="syn-plugin-name">${pluginId}</span>
                    <span class="syn-plugin-status-sub">${tests.length} tests defined</span>
                </div>
                <span class="syn-status-badge subtle-gray">Stored</span>
            `;

            row.addEventListener("click", () => {
                this.controller.setSelectedPluginId(pluginId);
                const detailsView = new SynSuiteDetailsView(this.controller, pluginId);
                this.controller.getNavPane().pushPane(pluginId, detailsView);
            });
        });
    }
}

// ============================================================================
// 4. SYN SUITE DETAILS VIEW (TEST TIMINGS & DIAGNOSTICS LAYER)
// ============================================================================

export class SynSuiteDetailsView extends UIComponent {
    private runResults: Map<string, SynAutomatedTestResult> = new Map();

    constructor(private controller: SynSuiteWidget, private readonly pluginId: string) {
        super(HTMLUtils.createDiv("syn-detail-view"));
        this.executeSuitePipeline();
    }

    draw(): void {
        this.setInnerHTML(`
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <div class="run-btn-anchor" style="flex: 1;"></div>
            </div>
            <div class="syn-tests-wrapper" style="display: flex; flex-direction: column; gap: 8px;"></div>
        `);

        // Safely map button using custom element declaration
        const runAnchor = this.getUnderlyingElement().querySelector(".run-btn-anchor") as HTMLElement;
        const runBtn = document.createElement("ide-button") as HTMLElement;
        runBtn.className = "run-suite-btn";
        runBtn.setAttribute("primary", "");
        runBtn.innerText = "Run Suite Tests";
        runBtn.style.width = "100%";
        runAnchor.appendChild(runBtn);

        runBtn.addEventListener("click", () => {
            this.executeSuitePipeline();
            this.redraw();
        });

        const wrapper = this.getUnderlyingElement().querySelector(".syn-tests-wrapper") as HTMLElement;

        if (this.runResults.size === 0) {
            wrapper.innerHTML = `<div style="font-size:11px; color:#64748b; padding:12px; text-align:center;">No tests configured for this plugin runtime block</div>`;
            return;
        }

        this.runResults.forEach((res, testKey) => {
            const card = HTMLUtils.createElement<HTMLDivElement>("div.syn-test-card", wrapper);
            const isPassed = res.passed();

            card.innerHTML = `
                <div class="syn-test-card-header">
                    <span class="syn-test-name">${testKey}</span>
                    <span class="syn-status-badge ${isPassed ? 'passed' : 'failed'}">
                        ${isPassed ? 'PASSED' : 'FAILED'}
                    </span>
                </div>
                <div class="syn-metric-row">
                    <span>Lex: <span class="syn-metric-value">${res.lexerTime.toFixed(1)}ms</span></span>
                    <span>Parse: <span class="syn-metric-value">${res.parserTime.toFixed(1)}ms</span></span>
                    <span>Inspect: <span class="syn-metric-value">${res.inspectionTime.toFixed(1)}ms</span></span>
                </div>
                ${!isPassed ? '<div class="patch-action-container" style="margin-top: 6px;"></div>' : ''}
            `;

            if (!isPassed) {
                const actionBox = card.querySelector(".patch-action-container") as HTMLElement;
                const patchBtn = document.createElement("ide-button") as HTMLElement;
                patchBtn.className = "patch-btn";
                patchBtn.innerText = "Mark as Accepted";
                actionBox.appendChild(patchBtn);
                patchBtn.setAttribute("secondary", "");

                patchBtn.addEventListener("click", async () => {
                    if (!(await PopupUtilsCore.confirm("Confirm", "Are you sure you want to override the current test?")))
                        return;
                    res.markAccepted();
                    this.executeSuitePipeline();
                    this.redraw();
                });
            }
        });
    }

    private executeSuitePipeline(): void {
        this.runResults = SynSuiteEngine.getInstance().runTests(this.pluginId, false, false);
    }
}