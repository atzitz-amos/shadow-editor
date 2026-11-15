import {UIComponent} from "../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../core/utils/HTMLUtils";
import {IdeTree} from "../../../core/ui/lib/tree/IdeTree";
import {IdeTreeModel} from "../../../core/ui/lib/tree/IdeTreeModel";
import {IdeMenuButton} from "../../../core/ui/lib/buttons/IdeMenuButton";
import {IdeDialogUtilsCore} from "../../../core/ui/lib/dialog/utils/IdeDialogUtilsCore";
import {FaIcon} from "../../../core/ui/icons/FaIcon";
import {SynSuiteEngine} from "../../../app/testLib/lang/suite/SynSuiteEngine";
import {SynSuiteGroups} from "../../../app/testLib/lang/suite/SynSuiteTest";
import {SynSuiteTestStore} from "../../../app/testLib/lang/suite/SynSuiteTestStore";

/**
 * Tree of the SynSuite groups, to choose the group of a new test case. Only groups are shown, and groups can be
 * created and, when empty, deleted from it.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteGroupPicker extends UIComponent {
    private readonly tree: IdeTree<string>;
    private readonly addButton: IdeMenuButton;
    private selectedGroup: string;

    constructor(initialGroup: string,
                private readonly onChange: (group: string) => void,
                private readonly onError: (message: string) => void) {
        super(HTMLUtils.createDiv("syn-suite-group-picker"));

        const store = this.getStore();
        this.selectedGroup = store.hasGroup(initialGroup) ? initialGroup : SynSuiteGroups.ROOT;

        const toolbar = HTMLUtils.createDiv("syn-suite-group-picker-toolbar", this.getUnderlyingElement());
        HTMLUtils.createElement("span.overline", toolbar).textContent = "Group";

        this.addButton = new IdeMenuButton(menu => {
            const selected = this.selectedGroup;
            menu.addHeader("New group");
            if (selected !== SynSuiteGroups.ROOT) {
                menu.addAction(`In ${selected}`, () => this.createGroup(selected), FaIcon.regular("folder"));
            }
            menu.addAction("At the root", () => this.createGroup(SynSuiteGroups.ROOT), FaIcon.solid("layer-group"));
        }, {icon: FaIcon.solid("plus"), tooltip: "New group…"});
        this.addChildTo(this.addButton, toolbar);

        const model: IdeTreeModel<string> = {
            getId: group => group,
            getRoots: () => [SynSuiteGroups.ROOT],
            isGroup: group => group === SynSuiteGroups.ROOT || store.getSubgroups(group).length > 0,
            getChildren: group => store.getSubgroups(group),
            getLabel: group => group === SynSuiteGroups.ROOT ? "All tests" : SynSuiteGroups.lastSegment(group)
        };

        const treeContainer = HTMLUtils.createDiv("syn-suite-group-picker-tree", this.getUnderlyingElement());
        this.tree = new IdeTree(null, model, {
            className: "syn-suite-group-tree",
            compare: (a, b) => a.localeCompare(b),
            getIcon: (group, expanded) => group === SynSuiteGroups.ROOT
                ? "fa-solid fa-layer-group"
                : (expanded ? "fa-regular fa-folder-open" : "fa-regular fa-folder"),
            decorate: (group, decorations) => {
                const count = store.getTestsIn(group, true).length;
                if (count > 0) decorations.appendChild(IdeTree.badge(count));
            },
            rowActions: group => {
                const actions = [IdeTree.actionButton("fa-solid fa-plus", "New subgroup…", () => this.createGroup(group))];
                if (group !== SynSuiteGroups.ROOT && store.getTestsIn(group, true).length === 0) {
                    actions.push(IdeTree.actionButton("fa-regular fa-trash-can", "Delete group", () => this.deleteGroup(group), true));
                }
                return actions;
            },
            // Open the way to the initial group
            isInitiallyExpanded: group => SynSuiteGroups.isWithin(this.selectedGroup, group) && group !== this.selectedGroup
                || group === SynSuiteGroups.ROOT,
            onSelect: group => {
                this.selectedGroup = group ?? SynSuiteGroups.ROOT;
                this.onChange(this.selectedGroup);
            }
        });
        this.addChildTo(this.tree, treeContainer);
    }

    async draw(): Promise<void> {
        this.addButton.draw();
        await this.tree.draw();
        this.tree.select(this.selectedGroup, false);
    }

    getSelectedGroup(): string {
        return this.selectedGroup;
    }

    focus(): void {
        this.tree.focus();
    }

    private getStore(): SynSuiteTestStore {
        return SynSuiteEngine.getInstance().getStore();
    }

    private async createGroup(parent: string) {
        const name = await IdeDialogUtilsCore.askString(
            parent === SynSuiteGroups.ROOT ? "New group" : `New group in ${parent}`,
            "name, or dotted.path for nested groups",
            FaIcon.regular("folder"));
        if (name === null) return;

        const group = SynSuiteGroups.join(parent, name.trim());
        if (!SynSuiteGroups.isValid(group)) {
            this.onError(`Invalid group name '${name.trim()}': use letters, digits, _, $ and -, separated by dots`);
            return;
        }

        this.getStore().addGroup(group);
        await this.tree.refresh();
        for (const ancestor of [SynSuiteGroups.ROOT, ...SynSuiteGroups.withAncestors(SynSuiteGroups.parent(group))]) {
            await this.tree.expand(ancestor);
        }
        this.tree.select(group);
    }

    private async deleteGroup(group: string) {
        if (!await IdeDialogUtilsCore.confirm("Delete group", `Delete the empty group '${group}' and its subgroups?`)) return;
        if (!this.getStore().removeGroup(group)) {
            this.onError(`The group '${group}' contains tests and cannot be deleted`);
            return;
        }

        if (SynSuiteGroups.isWithin(this.selectedGroup, group)) {
            this.tree.select(SynSuiteGroups.parent(group), false);
        }
        await this.tree.refresh();
        this.tree.focus();
    }
}
