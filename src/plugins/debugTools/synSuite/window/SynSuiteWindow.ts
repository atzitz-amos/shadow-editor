import {UIComponent} from "../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../core/utils/HTMLUtils";
import {GlobalState} from "../../../../core/global/GlobalState";
import {SynSuiteGroups} from "../../../../app/testLib/lang/suite/SynSuiteTest";
import {SynSuiteTestsChangedEvent} from "../../../../app/testLib/lang/suite/events/SynSuiteTestsChangedEvent";
import {SynSuiteTestsRunEvent} from "../../../../app/testLib/lang/suite/events/SynSuiteTestsRunEvent";
import {SynSuiteWindowContext} from "./SynSuiteWindowContext";
import {SynSuiteSelection, SynSuiteStateChange} from "./SynSuiteWindowState";
import {SynSuiteStatus} from "./SynSuiteStatus";
import {SynSuiteHeader} from "./SynSuiteHeader";
import {SynSuiteToolbar} from "./SynSuiteToolbar";
import {SynSuiteProgressBar} from "./SynSuiteProgressBar";
import {SynSuiteTestTree} from "./SynSuiteTestTree";
import {SynSuiteStatusBar} from "./SynSuiteStatusBar";
import {SynSuiteDetailPane} from "./detail/SynSuiteDetailPane";
import {SynSuiteLegacyImporter} from "../../../../app/testLib/lang/suite/legacy/SynSuiteLegacyImporter";

/**
 * The SynSuite window: browse the test cases by group, run them and inspect their results.
 * <p>
 * The components only render; this class decides what to update when the state, the run or the tests change.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteWindow extends UIComponent {
    private readonly context = new SynSuiteWindowContext();

    private readonly header: SynSuiteHeader;
    private readonly toolbar: SynSuiteToolbar;
    private readonly progressBar: SynSuiteProgressBar;
    private readonly tree: SynSuiteTestTree;
    private readonly detail: SynSuiteDetailPane;
    private readonly statusBar: SynSuiteStatusBar;

    constructor(onClose: () => void, private readonly requestedSelection: SynSuiteSelection | null = null) {
        super(HTMLUtils.createDiv("syn-suite-window"));

        this.header = new SynSuiteHeader(this.context, onClose);
        this.toolbar = new SynSuiteToolbar(this.context);
        this.progressBar = new SynSuiteProgressBar();
        this.tree = new SynSuiteTestTree(this.context);
        this.detail = new SynSuiteDetailPane(this.context);
        this.statusBar = new SynSuiteStatusBar(this.context);

        const root = this.getUnderlyingElement();
        this.addChildTo(this.header, root);
        this.addChildTo(this.toolbar, root);
        // Drawn over the bottom border of the toolbar, without taking room of its own
        this.addChildTo(this.progressBar, this.toolbar.getUnderlyingElement());
        const main = HTMLUtils.createDiv("syn-suite-main", root);
        this.addChildTo(this.tree, main);
        this.addChildTo(this.detail, main);
        this.addChildTo(this.statusBar, root);

        this.context.setNotifyHandler(message => this.statusBar.showNote(message));
        this.context.state.onChange(change => this.onStateChanged(change));
        this.context.runner.onChange(() => this.onStatusesChanged());

        const bus = GlobalState.getMainEventBus();
        bus.subscribe(this, SynSuiteTestsChangedEvent.SUBSCRIBER, () => this.onTestsChanged());
        // Tests may also run from elsewhere than this window
        bus.subscribe(this, SynSuiteTestsRunEvent.SUBSCRIBER, () => this.onStatusesChanged());
    }

    async draw(): Promise<void> {
        this.context.state.select(this.initialSelection());

        this.header.draw();
        this.toolbar.draw();
        this.statusBar.draw();
        this.detail.draw();
        await this.tree.draw();
        this.tree.focus();

        await this.importLegacyTests();
    }

    dispose(): void {
        const bus = GlobalState.getMainEventBus();
        bus.unsubscribe(this, SynSuiteTestsChangedEvent.SUBSCRIBER);
        bus.unsubscribe(this, SynSuiteTestsRunEvent.SUBSCRIBER);
        this.context.dispose();
        super.dispose();
    }

    /** Brings in the tests of the first version of SynSuite, the first time the window opens */
    private async importLegacyTests() {
        const store = this.context.store;
        if (store.isLegacyImportDone()) return;

        try {
            const report = await new SynSuiteLegacyImporter(store).importFromDatabase();
            store.markLegacyImportDone();
            if (report.imported > 0) {
                this.statusBar.showNote(`Imported ${report.imported} test${report.imported === 1 ? "" : "s"} from the previous SynSuite`);
            }
        } catch (e) {
            // Left undone so that it is attempted again on the next opening
            console.error("Could not import the legacy SynSuite tests", e);
        }
    }

    /** The requested selection, or the first failing test, or the root group */
    private initialSelection(): SynSuiteSelection {
        if (this.requestedSelection) return this.requestedSelection;

        const failing = this.context.store.getAll().find(test => SynSuiteStatus.isFailing(this.context.statusOf(test)));
        return failing ? {kind: "test" as const, id: failing.id} : {kind: "group" as const, path: SynSuiteGroups.ROOT};
    }

    private onStateChanged(change: SynSuiteStateChange) {
        switch (change) {
            case "selection":
                void this.tree.syncSelection();
                this.detail.draw();
                break;
            case "filter":
            case "search":
                this.toolbar.update();
                void this.tree.reload();
                break;
            case "tab":
                this.detail.draw();
                break;
        }
    }

    private onStatusesChanged() {
        const runner = this.context.runner;
        this.progressBar.setProgress(runner.isRunning() ? runner.getProgress() : null);

        this.header.draw();
        this.toolbar.update();
        this.statusBar.draw();
        this.detail.draw();

        // Statuses decide what the filter shows: reload once the run is over rather than at every test
        if (this.context.state.getFilter() !== "all" && !this.context.runner.isRunning()) void this.tree.reload();
        else this.tree.updateStatuses();
    }

    private onTestsChanged() {
        this.header.draw();
        this.statusBar.draw();
        this.detail.draw();
        void this.tree.reload();
    }
}
