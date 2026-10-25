import {IdeDialogUtilsCore} from "../../../../core/ui/lib/dialog/utils/IdeDialogUtilsCore";
import {FaIcon} from "../../../../core/ui/icons/FaIcon";
import {SynSuiteError} from "../../../../app/testLib/lang/suite/SynSuiteEngine";
import {SynSuiteGroups, SynSuiteTest} from "../../../../app/testLib/lang/suite/SynSuiteTest";
import type {SynSuiteWindowContext} from "./SynSuiteWindowContext";

/**
 * Organizes the suite from the window: creating, renaming, moving and deleting groups and tests. Names are asked
 * in dialogs stacked on the window, and errors are reported in its status bar.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteOrganizer {
    constructor(private readonly context: SynSuiteWindowContext) {
    }

    async createGroup(parent: string): Promise<void> {
        const name = await IdeDialogUtilsCore.askString(
            parent === SynSuiteGroups.ROOT ? "New group" : `New group in ${parent}`,
            "name, or dotted.path for nested groups",
            FaIcon.regular("folder"));
        if (name === null) return;

        const group = SynSuiteGroups.join(parent, name.trim());
        if (!SynSuiteGroups.isValid(group)) {
            this.context.notify(`Invalid group name '${name.trim()}'`);
            return;
        }
        if (this.context.store.hasGroup(group)) {
            this.context.notify(`The group '${group}' already exists`);
            return;
        }
        this.context.store.addGroup(group);
        this.context.state.select({kind: "group", path: group});
    }

    async renameGroup(group: string): Promise<void> {
        const name = await IdeDialogUtilsCore.askString(`Rename ${group}`, SynSuiteGroups.lastSegment(group), FaIcon.solid("pen"));
        if (name === null) return;
        this.attempt(() => this.followGroup(group, this.context.engine.renameGroup(group, name)));
    }

    moveGroup(group: string, parent: string): void {
        this.attempt(() => this.followGroup(group, this.context.engine.moveGroup(group, parent)));
    }

    async deleteGroup(group: string): Promise<void> {
        if (this.context.getTestsIn(group).length > 0) {
            this.context.notify(`'${group}' still contains tests: move or delete them first`);
            return;
        }
        if (!await IdeDialogUtilsCore.confirm("Delete group", `Delete the empty group '${group}' and its subgroups?`)) return;

        this.context.state.select({kind: "group", path: SynSuiteGroups.parent(group)});
        this.context.store.removeGroup(group);
    }

    async renameTest(test: SynSuiteTest): Promise<void> {
        const name = await IdeDialogUtilsCore.askString(`Rename ${this.context.pathOf(test)}`, test.name, FaIcon.solid("pen"));
        if (name === null) return;
        this.attempt(() => this.context.engine.renameTest(test.id, name));
    }

    moveTest(test: SynSuiteTest, group: string): void {
        this.attempt(() => this.context.engine.moveTest(test.id, group));
    }

    async deleteTest(test: SynSuiteTest): Promise<void> {
        if (!await IdeDialogUtilsCore.confirm("Delete test", `Delete the test '${this.context.pathOf(test)}'?`)) return;
        this.context.state.select({kind: "group", path: SynSuiteGroups.of(test)});
        this.context.engine.removeTest(test.id);
    }

    /** Runs the operation, reporting a refusal of the engine in the status bar */
    private attempt(operation: () => void) {
        try {
            operation();
        } catch (e) {
            if (!(e instanceof SynSuiteError)) throw e;
            this.context.notify(e.message);
        }
    }

    /** Keeps the selection on a group that moved, or on one of its subgroups */
    private followGroup(from: string, to: string) {
        const selection = this.context.state.getSelection();
        if (selection?.kind === "group" && SynSuiteGroups.isWithin(selection.path, from)) {
            this.context.state.select({kind: "group", path: to + selection.path.slice(from.length)});
        }
    }
}
