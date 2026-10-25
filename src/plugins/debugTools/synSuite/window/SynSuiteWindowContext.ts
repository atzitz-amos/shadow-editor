import {SynSuiteEngine} from "../../../../app/testLib/lang/suite/SynSuiteEngine";
import {SynSuiteGroups, SynSuiteTest} from "../../../../app/testLib/lang/suite/SynSuiteTest";
import {SynSuiteTestResult} from "../../../../app/testLib/lang/suite/SynSuiteTestResult";
import {SynSuiteTestStore} from "../../../../app/testLib/lang/suite/SynSuiteTestStore";
import {SynSuiteWindowState} from "./SynSuiteWindowState";
import {SynSuiteRunner} from "./SynSuiteRunner";
import {SynSuiteDisplayStatus, SynSuiteStatus} from "./SynSuiteStatus";
import {SynSuiteOrganizer} from "./SynSuiteOrganizer";

/**
 * Everything the components of the SynSuite window share: the state, the runner, and the queries built on them.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteWindowContext {
    readonly state: SynSuiteWindowState = new SynSuiteWindowState();
    readonly runner: SynSuiteRunner = new SynSuiteRunner();
    readonly organizer: SynSuiteOrganizer = new SynSuiteOrganizer(this);

    private notifyHandler: (message: string) => void = message => console.info(message);

    /** Where short messages for the user go, the status bar of the window */
    setNotifyHandler(handler: (message: string) => void): void {
        this.notifyHandler = handler;
    }

    notify(message: string): void {
        this.notifyHandler(message);
    }

    get engine(): SynSuiteEngine {
        return SynSuiteEngine.getInstance();
    }

    get store(): SynSuiteTestStore {
        return this.engine.getStore();
    }

    dispose(): void {
        this.state.dispose();
        this.runner.dispose();
    }

    statusOf(test: SynSuiteTest): SynSuiteDisplayStatus {
        return this.runner.statusOf(test);
    }

    resultOf(test: SynSuiteTest): SynSuiteTestResult | null {
        return this.engine.getLastResult(test.id);
    }

    /** Whether the test passes the filter and the search */
    isVisible(test: SynSuiteTest): boolean {
        const status = this.statusOf(test);
        const visibleByFilter = {
            all: true,
            failing: SynSuiteStatus.isFailing(status),
            passed: status === "passed",
            idle: status === "idle"
        }[this.state.getFilter()];

        const search = this.state.getSearch().toLowerCase();
        return visibleByFilter && (search === "" || this.pathOf(test).toLowerCase().includes(search));
    }

    pathOf(test: SynSuiteTest): string {
        return SynSuiteGroups.join(SynSuiteGroups.of(test), test.name);
    }

    getVisibleTests(): SynSuiteTest[] {
        return this.store.getAll().filter(test => this.isVisible(test));
    }

    /** Tests of the group and its subgroups */
    getTestsIn(group: string): SynSuiteTest[] {
        return this.store.getTestsIn(group, true);
    }

    getSelectedTest(): SynSuiteTest | null {
        const selection = this.state.getSelection();
        return selection?.kind === "test" ? this.store.get(selection.id) : null;
    }
}
