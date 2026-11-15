import {AbstractDialog, IdeResultDialog} from "../../../core/ui/lib/dialog/IdeDialog";
import {HTMLUtils} from "../../../core/utils/HTMLUtils";
import {Editor} from "../../../editor/Editor";
import {SynSuiteEngine, SynSuiteError} from "../../../app/testLib/lang/suite/SynSuiteEngine";
import {SynSuiteGroups, SynSuiteTest, SynSuiteTestOptions} from "../../../app/testLib/lang/suite/SynSuiteTest";
import {SynSuiteGroupPicker} from "./SynSuiteGroupPicker";
import {InspectionsRegistry} from "../../../lang/codeAnalysis/inspections/InspectionsRegistry";
import {PluginManager} from "../../../core/plugins/PluginManager";
import {InspectionBase} from "../../../lang/codeAnalysis/inspections/Inspection";

type PluginEntry = {
    id: string,
    checkbox: HTMLInputElement
}

/**
 * Asks for the name, description and options of a new SynSuite test case, then snapshots the file opened in the
 * editor. Pressing Enter adds the test; the options are remembered for the next snapshot.
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class SynSuiteSnapshotDialog extends AbstractDialog implements IdeResultDialog<SynSuiteTest> {
    private readonly element: HTMLElement = HTMLUtils.createDiv("syn-suite-snapshot-dialog");

    private readonly nameInput: HTMLInputElement;
    private readonly descriptionInput: HTMLInputElement;
    private readonly inspectionsCheckbox: HTMLInputElement;
    private readonly pluginsElement: HTMLElement;
    private readonly errorElement: HTMLElement;
    private readonly pathElement: HTMLElement;
    private readonly groupPicker: SynSuiteGroupPicker;
    private readonly plugins: PluginEntry[] = [];

    private createdTest: SynSuiteTest | null = null;

    constructor(private readonly editor: Editor) {
        super();

        const language = editor.getCurrentLanguage();
        const file = editor.getOpenedDocument().getAssociatedFile();
        const defaults = SynSuiteEngine.getInstance().getStore().getSnapshotDefaults();

        this.element.innerHTML = `
            <div class="syn-suite-header">
                <div class="syn-suite-title">New SynSuite test</div>
                <div class="syn-suite-close" data-action="close"><i class="fa fa-close"></i></div>
            </div>
            <div class="syn-suite-snapshot-body">
                <div class="syn-suite-snapshot-groups"></div>
                <div class="syn-suite-snapshot-form">
                    <label class="syn-suite-snapshot-field">
                        <span>Name</span>
                        <input class="syn-suite-snapshot-input" data-field="name" type="text" placeholder="array_spread_middle" spellcheck="false">
                    </label>
                    <div class="syn-suite-snapshot-field">
                        <span>Path</span>
                        <span class="syn-suite-snapshot-path"></span>
                    </div>
                    <label class="syn-suite-snapshot-field">
                        <span>Description</span>
                        <input class="syn-suite-snapshot-input" data-field="description" type="text" placeholder="Optional">
                    </label>
                    <div class="syn-suite-snapshot-options">
                        <label class="syn-suite-snapshot-check">
                            <input type="checkbox" data-field="inspections">
                            <span>Include inspections</span>
                        </label>
                        <div class="syn-suite-snapshot-plugins"></div>
                    </div>
                    <div class="syn-suite-snapshot-error"></div>
                </div>
            </div>
            <div class="syn-suite-snapshot-footer">
                <span class="syn-suite-snapshot-subtitle"></span>
                <ide-button secondary data-action="cancel">Cancel</ide-button>
                <ide-button primary data-action="add">Add test</ide-button>
            </div>
        `;

        this.nameInput = this.element.querySelector("[data-field=name]") as HTMLInputElement;
        this.descriptionInput = this.element.querySelector("[data-field=description]") as HTMLInputElement;
        this.inspectionsCheckbox = this.element.querySelector("[data-field=inspections]") as HTMLInputElement;
        this.pluginsElement = this.element.querySelector(".syn-suite-snapshot-plugins") as HTMLElement;
        this.errorElement = this.element.querySelector(".syn-suite-snapshot-error") as HTMLElement;

        this.pathElement = this.element.querySelector(".syn-suite-snapshot-path") as HTMLElement;

        const subtitle = this.element.querySelector(".syn-suite-snapshot-subtitle") as HTMLElement;
        subtitle.textContent = [file?.getName() ?? "Untitled", language?.getDisplayName() ?? "No language"].join(" · ");

        this.groupPicker = new SynSuiteGroupPicker(
            defaults.group ?? SynSuiteGroups.ROOT,
            () => this.updatePath(),
            message => this.showError(message));
        this.element.querySelector(".syn-suite-snapshot-groups")!.appendChild(this.groupPicker.getUnderlyingElement());
        void this.groupPicker.draw();
        this.onClose(() => this.groupPicker.dispose());

        this.nameInput.addEventListener("input", () => this.updatePath());
        this.updatePath();

        if (language) {
            this.createPluginEntries(InspectionsRegistry.getAllForLanguage(language), defaults.pluginIds);
        } else {
            this.showError("The opened file has no registered language, it cannot be snapshotted");
        }

        this.inspectionsCheckbox.checked = defaults.includeInspections;
        this.inspectionsCheckbox.addEventListener("change", () => this.updatePluginsState());
        this.updatePluginsState();

        this.element.querySelector("[data-action=close]")!.addEventListener("click", () => this.close(true));
        this.element.querySelector("[data-action=cancel]")!.addEventListener("click", () => this.close(true));
        this.element.querySelector("[data-action=add]")!.addEventListener("click", () => this.submit());

        this.element.addEventListener("keydown", e => {
            // Buttons already turn Enter into a click, and the tree uses it to toggle groups
            if (e.key === "Enter" && !(e.target as HTMLElement).closest("ide-button, .ide-tree")) {
                e.preventDefault();
                this.submit();
            }
        });

        setTimeout(() => this.nameInput.focus(), 0);
    }

    awaitResult(): Promise<SynSuiteTest | null> {
        return new Promise(resolve => {
            this.onClose(wasCancelled => resolve(wasCancelled ? null : this.createdTest));
        });
    }

    protected getPopupElement(): HTMLElement {
        return this.element;
    }

    private createPluginEntries(inspections: InspectionBase[], selectedIds: string[] | null) {
        const counts = new Map<string, number>();
        for (const inspection of inspections) {
            const pluginId = InspectionsRegistry.definingPlugin(inspection)?.getId();
            if (pluginId) counts.set(pluginId, (counts.get(pluginId) ?? 0) + 1);
        }

        for (const loaded of PluginManager.getInstance().getPluginList()) {
            const id = loaded.getPlugin().getId();
            if (!counts.has(id)) continue;

            const row = HTMLUtils.createElement<HTMLLabelElement>("label.syn-suite-snapshot-check", this.pluginsElement);
            const checkbox = row.appendChild(document.createElement("input"));
            checkbox.type = "checkbox";
            checkbox.checked = selectedIds === null || selectedIds.includes(id);

            row.appendChild(document.createElement("span")).textContent = loaded.getPluginName();
            const count = counts.get(id)!;
            HTMLUtils.createElement("span.syn-suite-snapshot-muted", row).textContent =
                `${id} · ${count} inspection${count > 1 ? "s" : ""}`;

            this.plugins.push({id, checkbox});
        }

        if (this.plugins.length === 0) {
            HTMLUtils.createDiv("syn-suite-snapshot-muted", this.pluginsElement).textContent = "No plugin defines inspections for this language";
        }
    }

    private updatePluginsState() {
        const enabled = this.inspectionsCheckbox.checked;
        this.pluginsElement.classList.toggle("disabled", !enabled);
        this.plugins.forEach(plugin => plugin.checkbox.disabled = !enabled);
    }

    private readOptions(): SynSuiteTestOptions {
        return {
            includeInspections: this.inspectionsCheckbox.checked,
            pluginIds: this.plugins.filter(plugin => plugin.checkbox.checked).map(plugin => plugin.id)
        };
    }

    /**
     * Remembers the options. Only the plugins listed in the dialog are updated, so that the choices made for
     * the plugins of other languages are kept. Selecting every plugin is stored as "every plugin", so that
     * plugins loaded later are selected by default too.
     */
    private saveDefaults(options: SynSuiteTestOptions) {
        const store = SynSuiteEngine.getInstance().getStore();
        const allIds = PluginManager.getInstance().getPluginList().map(p => p.getPlugin().getId());

        const selected = new Set(store.getSnapshotDefaults().pluginIds ?? allIds);
        for (const plugin of this.plugins) {
            if (options.pluginIds.includes(plugin.id)) selected.add(plugin.id);
            else selected.delete(plugin.id);
        }

        store.setSnapshotDefaults({
            includeInspections: options.includeInspections,
            pluginIds: allIds.every(id => selected.has(id)) ? null : [...selected],
            group: this.groupPicker.getSelectedGroup()
        });
    }

    private updatePath() {
        const name = this.nameInput.value.trim();
        const group = this.groupPicker.getSelectedGroup();

        this.pathElement.innerHTML = "";
        if (group !== SynSuiteGroups.ROOT) {
            HTMLUtils.createElement("span.syn-suite-snapshot-path-group", this.pathElement).textContent = group + ".";
        }
        const nameElement = HTMLUtils.createElement("span.syn-suite-snapshot-path-name", this.pathElement);
        nameElement.textContent = name || "<name>";
        nameElement.classList.toggle("placeholder", !name);
    }

    private submit() {
        const options = this.readOptions();

        try {
            this.createdTest = SynSuiteEngine.getInstance().snapshot(this.editor, {
                name: this.nameInput.value,
                group: this.groupPicker.getSelectedGroup(),
                description: this.descriptionInput.value,
                options
            });
        } catch (e) {
            if (!(e instanceof SynSuiteError)) throw e;

            this.showError(e.message);
            this.nameInput.focus();
            return;
        }

        this.saveDefaults(options);
        this.close(false);
    }

    private showError(message: string) {
        this.errorElement.textContent = message;
        this.errorElement.classList.add("visible");
    }
}
