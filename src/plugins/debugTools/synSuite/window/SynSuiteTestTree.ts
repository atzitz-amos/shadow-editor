import {UIComponent} from "../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../core/utils/HTMLUtils";
import {IdeTree} from "../../../../core/ui/lib/tree/IdeTree";
import {IdeTreeModel} from "../../../../core/ui/lib/tree/IdeTreeModel";
import {SynSuiteGroups, SynSuiteTest} from "../../../../app/testLib/lang/suite/SynSuiteTest";
import {SynSuiteWindowContext} from "./SynSuiteWindowContext";
import {SynSuiteSelection} from "./SynSuiteWindowState";
import {SynSuiteStatus} from "./SynSuiteStatus";

const GROUP_PREFIX = "group:";
const TEST_PREFIX = "test:";

/**
 * Ids of the tree nodes: "group:js.parser" for a group, "test:<id>" for a test.
 */
class SynSuiteNodes {
    static group(path: string): string {
        return GROUP_PREFIX + path;
    }

    static test(id: string): string {
        return TEST_PREFIX + id;
    }

    static isGroup(node: string): boolean {
        return node.startsWith(GROUP_PREFIX);
    }

    /** The group path or the test id behind the node */
    static value(node: string): string {
        return node.slice(SynSuiteNodes.isGroup(node) ? GROUP_PREFIX.length : TEST_PREFIX.length);
    }

    static toSelection(node: string): SynSuiteSelection {
        return SynSuiteNodes.isGroup(node)
            ? {kind: "group", path: SynSuiteNodes.value(node)}
            : {kind: "test", id: SynSuiteNodes.value(node)};
    }

    static fromSelection(selection: SynSuiteSelection): string {
        return selection.kind === "group" ? SynSuiteNodes.group(selection.path) : SynSuiteNodes.test(selection.id);
    }
}

/**
 * Tree of the groups and tests of the suite, restricted to what passes the filter and the search. Tests show
 * their status as their icon; a group containing a failing test is tinted.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteTestTree extends UIComponent {
    private readonly tree: IdeTree<string>;

    /** Expansion chosen by the user, put aside while filtering expands everything */
    private expansionBeforeFiltering: string[] | null = null;
    /** Set while the tree changes the selection itself, e.g. when a reload hides the selected node */
    private updatingTree: boolean = false;

    /** The reload running or last run, the next one waits for it */
    private currentReload: Promise<void> = Promise.resolve();
    /** A reload waiting for its turn, which further requests join */
    private pendingReload: Promise<void> | null = null;

    constructor(private readonly context: SynSuiteWindowContext) {
        super(HTMLUtils.createDiv("syn-suite-tree"));

        const model: IdeTreeModel<string> = {
            getId: node => node,
            getRoots: () => this.childrenOf(SynSuiteGroups.ROOT),
            isGroup: node => SynSuiteNodes.isGroup(node),
            getChildren: node => this.childrenOf(SynSuiteNodes.value(node)),
            getLabel: node => SynSuiteNodes.isGroup(node)
                ? SynSuiteGroups.lastSegment(SynSuiteNodes.value(node))
                : this.testOf(node)?.name ?? ""
        };

        this.tree = new IdeTree(null, model, {
            className: "syn-suite-test-tree",
            emptyText: "No test matches",
            compare: (a, b) => Number(SynSuiteNodes.isGroup(b)) - Number(SynSuiteNodes.isGroup(a))
                || model.getLabel(a).localeCompare(model.getLabel(b)),
            getIcon: (node, expanded) => {
                if (SynSuiteNodes.isGroup(node)) return expanded ? "fa-regular fa-folder-open" : "fa-regular fa-folder";
                const test = this.testOf(node);
                return test ? SynSuiteStatus.iconClasses(context.statusOf(test)) : null;
            },
            getClassName: node => SynSuiteNodes.isGroup(node) && this.hasFailures(SynSuiteNodes.value(node)) ? "has-failures" : null,
            renderLabel: (node, label) => this.renderLabel(model.getLabel(node), label),
            decorate: (node, decorations) => {
                if (!SynSuiteNodes.isGroup(node)) return;
                const count = this.visibleTestsIn(SynSuiteNodes.value(node)).length;
                HTMLUtils.createElement("span.syn-suite-tree-count", decorations).textContent = String(count);
            },
            rowActions: node => this.rowActions(node),
            isInitiallyExpanded: (_, depth) => depth < 2,
            onSelect: node => {
                if (!this.updatingTree && node !== null) context.state.select(SynSuiteNodes.toSelection(node));
            },
            onKeydown: (event, node) => this.onKeydown(event, node),

            // Tests and groups are moved by dropping them on a group, a test of the group, or the empty area for the root
            canDrag: () => true,
            canDrop: (dragged, target) => this.canMove(dragged, this.groupAt(target)),
            onDrop: (dragged, target) => this.move(dragged, this.groupAt(target))
        });
        this.addChildTo(this.tree, this.getUnderlyingElement());
    }

    async draw(): Promise<void> {
        await this.tree.draw();
        await this.syncSelection();
    }

    /**
     * Reloads the groups and tests, after tests were added or removed, or the filter changed. Requests made while
     * a reload runs are merged into a single reload after it.
     */
    reload(): Promise<void> {
        if (this.pendingReload) return this.pendingReload;

        const run = this.currentReload.then(() => {
            this.pendingReload = null;
            return this.doReload();
        });
        this.pendingReload = run;
        this.currentReload = run.catch(() => undefined);
        return run;
    }

    /** Renders the rows again, after statuses changed */
    updateStatuses(): void {
        this.tree.updateAll();
    }

    focus(): void {
        this.tree.focus();
    }

    /** Selects the node of the current selection, expanding the groups leading to it, if it is shown */
    async syncSelection(): Promise<void> {
        const selection = this.context.state.getSelection();
        if (!selection) {
            this.tree.clearSelection();
            return;
        }

        const test = selection.kind === "test" ? this.context.store.get(selection.id) : null;
        const group = selection.kind === "group"
            ? SynSuiteGroups.parent(selection.path)
            : test ? SynSuiteGroups.of(test) : SynSuiteGroups.ROOT;
        for (const ancestor of SynSuiteGroups.withAncestors(group)) {
            await this.tree.expand(SynSuiteNodes.group(ancestor));
        }

        const node = SynSuiteNodes.fromSelection(selection);
        if (this.tree.getNodeById(node) !== null) this.tree.select(node, false);
    }

    private async doReload(): Promise<void> {
        this.updatingTree = true;
        try {
            const filtering = this.context.state.isFiltering();
            if (filtering && this.expansionBeforeFiltering === null) {
                this.expansionBeforeFiltering = this.tree.getExpandedNodes();
            }

            await this.tree.refresh();

            if (filtering) {
                await this.tree.expandAll();
            } else if (this.expansionBeforeFiltering !== null) {
                // Back to the full tree: restore the expansion the user had before filtering
                this.tree.collapseAll();
                for (const node of this.expansionBeforeFiltering) await this.tree.expand(node);
                this.expansionBeforeFiltering = null;
            }
            await this.syncSelection();
        } finally {
            this.updatingTree = false;
        }
    }

    // ---- organization ----

    private rowActions(node: string): HTMLElement[] {
        const organizer = this.context.organizer;

        if (!SynSuiteNodes.isGroup(node)) {
            const test = this.testOf(node);
            return test ? [IdeTree.actionButton("fa-solid fa-pen", "Rename (F2)", () => organizer.renameTest(test))] : [];
        }

        const group = SynSuiteNodes.value(node);
        const actions = [
            IdeTree.actionButton("fa-solid fa-plus", "New subgroup…", () => organizer.createGroup(group)),
            IdeTree.actionButton("fa-solid fa-pen", "Rename (F2)", () => organizer.renameGroup(group))
        ];
        if (this.context.getTestsIn(group).length === 0) {
            actions.push(IdeTree.actionButton("fa-regular fa-trash-can", "Delete group", () => organizer.deleteGroup(group), true));
        }
        return actions;
    }

    private onKeydown(event: KeyboardEvent, node: string) {
        const organizer = this.context.organizer;
        const test = SynSuiteNodes.isGroup(node) ? null : this.testOf(node);

        if (event.key === "F2") {
            if (test) void organizer.renameTest(test);
            else void organizer.renameGroup(SynSuiteNodes.value(node));
        } else if (event.key === "Delete") {
            if (test) void organizer.deleteTest(test);
            else void organizer.deleteGroup(SynSuiteNodes.value(node));
        } else {
            return;
        }
        event.preventDefault();
    }

    /** The group a node dropped on the target goes into: the group itself, the group of a test, or the root */
    private groupAt(target: string | null): string {
        if (target === null) return SynSuiteGroups.ROOT;
        if (SynSuiteNodes.isGroup(target)) return SynSuiteNodes.value(target);
        const test = this.testOf(target);
        return test ? SynSuiteGroups.of(test) : SynSuiteGroups.ROOT;
    }

    private canMove(node: string, group: string): boolean {
        if (!SynSuiteNodes.isGroup(node)) {
            const test = this.testOf(node);
            return test !== null && SynSuiteGroups.of(test) !== group;
        }

        const moved = SynSuiteNodes.value(node);
        const intoItself = group !== SynSuiteGroups.ROOT && SynSuiteGroups.isWithin(group, moved);
        return !intoItself && SynSuiteGroups.parent(moved) !== group;
    }

    private move(node: string, group: string) {
        if (SynSuiteNodes.isGroup(node)) {
            this.context.organizer.moveGroup(SynSuiteNodes.value(node), group);
        } else {
            const test = this.testOf(node);
            if (test) this.context.organizer.moveTest(test, group);
        }
    }

    private testOf(node: string): SynSuiteTest | null {
        return this.context.store.get(SynSuiteNodes.value(node));
    }

    private visibleTestsIn(group: string): SynSuiteTest[] {
        return this.context.getTestsIn(group).filter(test => this.context.isVisible(test));
    }

    private hasFailures(group: string): boolean {
        return this.context.getTestsIn(group).some(test => SynSuiteStatus.isFailing(this.context.statusOf(test)));
    }

    private childrenOf(group: string): string[] {
        const filtering = this.context.state.isFiltering();
        // While filtering, groups without any matching test are hidden
        const groups = this.context.store.getSubgroups(group)
            .filter(subgroup => !filtering || this.visibleTestsIn(subgroup).length > 0)
            .map(SynSuiteNodes.group);
        const tests = this.context.store.getTestsIn(group)
            .filter(test => this.context.isVisible(test))
            .map(test => SynSuiteNodes.test(test.id));
        return [...groups, ...tests];
    }

    /** The label, with the part matching the search highlighted */
    private renderLabel(text: string, label: HTMLElement) {
        const search = this.context.state.getSearch();
        const index = search ? text.toLowerCase().indexOf(search.toLowerCase()) : -1;
        if (index === -1) {
            label.textContent = text;
            return;
        }

        label.append(text.slice(0, index));
        HTMLUtils.createElement("mark.syn-suite-match", label).textContent = text.slice(index, index + search.length);
        label.append(text.slice(index + search.length));
    }
}
