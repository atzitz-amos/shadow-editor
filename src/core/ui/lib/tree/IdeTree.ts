import {UIComponent, UIComponentMixin} from "../../engine/components/UIComponent";
import {Focusable} from "../../engine/mixins/Focusable";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {Icon} from "../../icons/Icon";
import {ContextMenuElement} from "../menu/impl/ContextMenu";
import {ContextResolver} from "../../../keybinds/context/ContextResolver";
import {IdeTreeModel, IdeTreeOptions} from "./IdeTreeModel";

interface TreeRecord<T> {
    node: T;
    readonly id: string;
    readonly parent: TreeRecord<T> | null;
    readonly depth: number;

    readonly li: HTMLLIElement;
    readonly row: HTMLElement;
    readonly caret: HTMLElement;
    readonly icon: HTMLElement;
    readonly label: HTMLElement;
    readonly decorations: HTMLElement;
    readonly actions: HTMLElement;
    actionComponents: UIComponent[];

    childList?: HTMLUListElement;
    /** Undefined until the children are loaded for the first time */
    children?: TreeRecord<T>[];
    loading?: Promise<void>;

    unregisterContext: () => void;
}

/**
 * A collapsible tree of groups and leaves, driven by an {@link IdeTreeModel}.
 * <p>
 * The DOM of a row is built once and then patched: inserting, removing or updating a node never rebuilds its
 * siblings, and collapsing a group only hides its children, so an expanded subtree survives being collapsed.
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class IdeTree<T> extends UIComponentMixin(Focusable) {
    private readonly records: Map<string, TreeRecord<T>> = new Map<string, TreeRecord<T>>();
    private readonly expanded: Set<TreeRecord<T>> = new Set<TreeRecord<T>>();
    private selected: TreeRecord<T> | null = null;

    private rootList: HTMLUListElement;
    private roots: TreeRecord<T>[] = [];
    private refreshQueue: Promise<void> = Promise.resolve();

    private dragged: TreeRecord<T> | null = null;
    private dropTarget: TreeRecord<T> | null | undefined = undefined;
    private dragExpandTimer: number | null = null;

    constructor(parent: HTMLElement | null,
                protected readonly model: IdeTreeModel<T>,
                protected readonly options: IdeTreeOptions<T> = {}) {
        super(HTMLUtils.createDiv("ide-tree", parent ?? undefined));
        this.applyOptions();
        this.setupDragAndDrop();
    }

    // ---- decoration helpers ----------------------------------------------

    /** A rounded counter, for {@link IdeTreeOptions.decorate} */
    static badge(text: string | number): HTMLElement {
        const badge = HTMLUtils.createElement("span.ide-tree-badge");
        badge.textContent = String(text);
        return badge;
    }

    /** A colored status dot, for {@link IdeTreeOptions.decorate} */
    static dot(color: string, tooltip?: string): HTMLElement {
        const dot = HTMLUtils.createElement("span.ide-tree-dot");
        dot.style.background = color;
        if (tooltip) dot.title = tooltip;
        return dot;
    }

    /** A small icon button, for {@link IdeTreeOptions.rowActions} */
    static actionButton(icon: Icon | string, tooltip: string, onClick: (e: MouseEvent) => void, danger: boolean = false): HTMLElement {
        const button = HTMLUtils.createElement<HTMLButtonElement>("button.ide-tree-action");
        button.type = "button";
        button.title = tooltip;
        button.tabIndex = -1;
        button.classList.toggle("danger", danger);
        if (icon instanceof Icon) {
            button.appendChild(icon.toHTML());
        } else {
            button.appendChild(document.createElement("i")).className = icon;
        }
        button.addEventListener("click", e => {
            e.stopPropagation();
            onClick(e);
        });
        return button;
    }

    // ---- lifecycle -------------------------------------------------------

    async draw(): Promise<void> {
        this.clearRecords();
        this.getUnderlyingElement().innerHTML = "";

        this.rootList = document.createElement("ul");
        this.rootList.className = "ide-tree-root";
        this.rootList.setAttribute("role", "tree");
        this.getUnderlyingElement().appendChild(this.rootList);

        await this.loadRoots(true);
    }

    dispose(): void {
        this.clearRecords();
        super.dispose();
    }

    getModel(): IdeTreeModel<T> {
        return this.model;
    }

    /**
     * Changes options after creation. Rendering options apply to rows rendered from now on, call
     * {@link updateAll()} to apply them to the existing rows.
     */
    setOptions(options: Partial<IdeTreeOptions<T>>): void {
        Object.assign(this.options, options);
        this.applyOptions();
    }

    // ---- queries ---------------------------------------------------------

    getNodeById(id: string): T | null {
        return this.records.get(id)?.node ?? null;
    }

    getParentNode(node: T): T | null {
        return this.recordOf(node)?.parent?.node ?? null;
    }

    getSelected(): T | null {
        return this.selected?.node ?? null;
    }

    /**
     * @returns the expanded groups, each after its expanded ancestors, so that expanding them in order restores
     * the expansion
     */
    getExpandedNodes(): T[] {
        return [...this.expanded].sort((a, b) => a.depth - b.depth).map(record => record.node);
    }

    isExpanded(node: T): boolean {
        const record = this.recordOf(node);
        return !!record && this.expanded.has(record);
    }

    /**
     * @returns the loaded children of the node, the roots for null, or null if they are not loaded yet
     */
    getLoadedChildren(node: T | null): T[] | null {
        if (node === null) return this.roots.map(r => r.node);
        return this.recordOf(node)?.children?.map(r => r.node) ?? null;
    }

    // ---- expansion -------------------------------------------------------

    expand(node: T): Promise<void> {
        const record = this.recordOf(node);
        return record ? this.expandRecord(record) : Promise.resolve();
    }

    collapse(node: T): void {
        const record = this.recordOf(node);
        if (record) this.collapseRecord(record);
    }

    toggle(node: T): Promise<void> {
        const record = this.recordOf(node);
        if (!record) return Promise.resolve();
        if (this.expanded.has(record)) {
            this.collapseRecord(record);
            return Promise.resolve();
        }
        return this.expandRecord(record);
    }

    /**
     * Expands every group, loading children as needed.
     *
     * @param maxDepth deepest level to expand, unlimited by default
     */
    async expandAll(maxDepth: number = Infinity): Promise<void> {
        const visit = async (records: TreeRecord<T>[]) => {
            for (const record of records) {
                if (!this.model.isGroup(record.node) || record.depth > maxDepth) continue;
                await this.expandRecord(record);
                await visit(record.children ?? []);
            }
        };
        await visit(this.roots);
    }

    collapseAll(): void {
        for (const record of [...this.expanded]) this.collapseRecord(record);
    }

    /**
     * Expands the ancestors of the node so that it is visible.
     */
    reveal(node: T): void {
        let parent = this.recordOf(node)?.parent ?? null;
        while (parent) {
            void this.expandRecord(parent);
            parent = parent.parent;
        }
    }

    // ---- selection -------------------------------------------------------

    select(node: T, focus: boolean = true): void {
        const record = this.recordOf(node);
        if (!record) return;
        this.reveal(node);
        this.selectRecord(record, focus);
    }

    clearSelection(): void {
        if (!this.selected) return;
        this.markSelectionPath(this.selected, false);
        this.selected.row.classList.remove("selected");
        this.selected = null;
        this.options.onSelect?.(null);
    }

    focus(): void {
        (this.selected?.row ?? this.roots[0]?.row)?.focus();
    }

    // ---- modifications ---------------------------------------------------

    /**
     * Adds a node to its parent (null for a root), at its sorted position. Nothing happens if the children of
     * the parent were never loaded: they will be when it is expanded.
     */
    insert(parent: T | null, node: T): void {
        const parentRecord = parent === null ? null : this.recordOf(parent);
        if (parent !== null && !parentRecord) return;
        if (this.records.has(this.model.getId(node))) return;

        const siblings = parentRecord ? parentRecord.children : this.roots;
        if (!siblings) return;

        const record = this.buildRecord(node, parentRecord);
        const index = this.sortedIndex(siblings, node);
        siblings.splice(index, 0, record);

        const list = parentRecord ? this.ensureChildList(parentRecord) : this.rootList;
        list.insertBefore(record.li, list.children[index] ?? null);

        if (parentRecord) this.renderRecord(parentRecord);
        this.updateEmptyState();
    }

    remove(node: T): void {
        const record = this.recordOf(node);
        if (!record) return;

        const siblings = record.parent ? record.parent.children! : this.roots;
        siblings.splice(siblings.indexOf(record), 1);

        if (this.selected && (this.selected === record || this.isAncestor(record, this.selected))) {
            this.clearSelection();
        }

        record.li.remove();
        this.cleanup(record);

        if (record.parent) this.renderRecord(record.parent);
        this.updateEmptyState();
    }

    /**
     * Renders the node again and moves it to its sorted position. The node may be a new object, as long as its
     * id did not change.
     */
    update(node: T): void {
        const record = this.records.get(this.model.getId(node));
        if (!record) return;

        record.node = node;
        this.renderRecord(record);

        const siblings = record.parent ? record.parent.children! : this.roots;
        siblings.splice(siblings.indexOf(record), 1);
        const index = this.sortedIndex(siblings, node);
        siblings.splice(index, 0, record);

        // Move the same element so that an expanded subtree survives the update
        const list = record.parent ? record.parent.childList! : this.rootList;
        record.li.remove();
        list.insertBefore(record.li, list.children[index] ?? null);
    }

    /**
     * Renders every row again, e.g. after the decorations changed.
     */
    updateAll(): void {
        for (const record of this.records.values()) this.renderRecord(record);
    }

    /**
     * Reloads the children of the node from the model, or the whole tree when called without a node, keeping
     * the expanded groups and the selection that still exist. Refreshes run one after the other: overlapping
     * ones would each rebuild the same rows.
     */
    refresh(node?: T): Promise<void> {
        const run = this.refreshQueue.then(() => this.doRefresh(node));
        this.refreshQueue = run.catch(() => undefined);
        return run;
    }

    private async doRefresh(node?: T): Promise<void> {
        const expandedIds = new Set([...this.expanded].map(r => r.id));
        const previous = this.selected;
        if (previous) this.markSelectionPath(previous, false);

        if (node === undefined) {
            this.clearRecords();
            this.rootList.innerHTML = "";
            await this.loadRoots(false);
            await this.restoreExpansion(this.roots, expandedIds);
        } else {
            const record = this.recordOf(node);
            if (!record || !record.children) return;

            for (const child of record.children) this.cleanup(child);
            record.children = undefined;
            record.childList!.innerHTML = "";

            if (this.expanded.has(record)) {
                await this.loadChildren(record, false);
                await this.restoreExpansion(record.children ?? [], expandedIds);
            }
        }

        // Records of the reloaded part were rebuilt: select the new record of the same node, if it still exists
        const restored = previous ? this.records.get(previous.id) : undefined;
        if (restored && restored !== this.selected) {
            this.selectRecord(restored, false);
        } else if (this.selected) {
            this.markSelectionPath(this.selected, true);
        } else if (previous) {
            this.options.onSelect?.(null);
        }
    }

    // ---- drag and drop ---------------------------------------------------

    private setupDragAndDrop() {
        const root = this.getUnderlyingElement();
        const recordAt = (target: EventTarget | null): TreeRecord<T> | null => {
            const row = target instanceof Element ? target.closest<HTMLElement>(".ide-tree-row") : null;
            return row ? this.records.get(row.dataset.nodeId!) ?? null : null;
        };

        root.addEventListener("dragstart", e => {
            const record = recordAt(e.target);
            if (!record || !this.options.canDrag?.(record.node)) return;

            this.dragged = record;
            record.row.classList.add("dragging");
            e.dataTransfer!.effectAllowed = "move";
            e.dataTransfer!.setData("text/plain", this.model.getLabel(record.node));
        });

        root.addEventListener("dragover", e => {
            if (!this.dragged) return;
            const target = recordAt(e.target);
            if (!(this.options.canDrop?.(this.dragged.node, target?.node ?? null) ?? false)) {
                this.setDropTarget(undefined);
                return;
            }
            e.preventDefault();
            e.dataTransfer!.dropEffect = "move";
            this.setDropTarget(target);
        });

        root.addEventListener("dragleave", e => {
            // Leaving the tree, not just moving from one of its rows to another
            if (!root.contains(e.relatedTarget as Node | null)) this.setDropTarget(undefined);
        });

        root.addEventListener("drop", e => {
            if (!this.dragged || this.dropTarget === undefined) return;
            e.preventDefault();

            const dragged = this.dragged.node;
            const target = this.dropTarget?.node ?? null;
            this.endDrag();
            this.options.onDrop?.(dragged, target);
        });

        root.addEventListener("dragend", () => this.endDrag());
    }

    /**
     * Highlights where the dragged node would go: a row, the whole tree (null, its empty area), or nothing
     * (undefined). Hovering a collapsed group long enough expands it.
     */
    private setDropTarget(target: TreeRecord<T> | null | undefined) {
        if (target === this.dropTarget) return;

        this.dropTarget?.row.classList.remove("drop-target");
        this.getUnderlyingElement().classList.toggle("drop-root", target === null);
        if (this.dragExpandTimer !== null) clearTimeout(this.dragExpandTimer);
        this.dragExpandTimer = null;

        this.dropTarget = target;
        if (!target) return;

        target.row.classList.add("drop-target");
        if (this.model.isGroup(target.node) && !this.expanded.has(target)) {
            this.dragExpandTimer = window.setTimeout(() => void this.expandRecord(target), 600);
        }
    }

    private endDrag() {
        this.dragged?.row.classList.remove("dragging");
        this.dragged = null;
        this.setDropTarget(undefined);
    }

    // ---- records ---------------------------------------------------------

    private applyOptions() {
        const element = this.getUnderlyingElement();
        element.className = "ide-tree";
        if (this.options.className) element.classList.add(...this.options.className.split(" ").filter(Boolean));
        element.classList.toggle("show-guides", this.options.indentGuides ?? true);
        element.style.setProperty("--ide-tree-indent", HTMLUtils.px(this.options.indent ?? 18));
        element.style.setProperty("--ide-tree-row-height", HTMLUtils.px(this.options.rowHeight ?? 24));
    }

    private recordOf(node: T): TreeRecord<T> | null {
        return this.records.get(this.model.getId(node)) ?? null;
    }

    private async loadRoots(initial: boolean) {
        const nodes = await this.model.getRoots();
        if (this.isDisposed()) return;

        this.roots = this.sort(nodes).map(node => this.buildRecord(node, null));
        this.roots.forEach(record => this.rootList.appendChild(record.li));
        this.updateEmptyState();

        if (initial) await this.applyInitialExpansion(this.roots);
    }

    private async applyInitialExpansion(records: TreeRecord<T>[]) {
        const isInitiallyExpanded = this.options.isInitiallyExpanded;
        if (!isInitiallyExpanded) return;

        for (const record of records) {
            if (this.model.isGroup(record.node) && isInitiallyExpanded(record.node, record.depth)) {
                await this.expandRecord(record);
            }
        }
    }

    private async restoreExpansion(records: TreeRecord<T>[], expandedIds: Set<string>) {
        for (const record of records) {
            if (!expandedIds.has(record.id)) continue;
            await this.expandRecord(record);
            await this.restoreExpansion(record.children ?? [], expandedIds);
        }
    }

    private buildRecord(node: T, parent: TreeRecord<T> | null): TreeRecord<T> {
        const li = document.createElement("li");
        li.setAttribute("role", "treeitem");

        const row = HTMLUtils.createDiv("ide-tree-row", li);
        row.tabIndex = -1;

        const record: TreeRecord<T> = {
            node,
            id: this.model.getId(node),
            parent,
            depth: parent ? parent.depth + 1 : 0,
            li,
            row,
            caret: HTMLUtils.createElement("span.ide-tree-caret", row),
            icon: HTMLUtils.createElement("span.ide-tree-icon", row),
            label: HTMLUtils.createElement("span.ide-tree-label", row),
            decorations: HTMLUtils.createElement("span.ide-tree-decorations", row),
            actions: HTMLUtils.createElement("span.ide-tree-row-actions", row),
            actionComponents: [],
            unregisterContext: () => {
            }
        };
        row.style.setProperty("--depth", String(record.depth));
        row.dataset.nodeId = record.id;

        record.unregisterContext = ContextResolver.register(row, {
            provide: key => this.options.provideData?.(record.node, key)
        });

        record.caret.addEventListener("click", e => {
            e.stopPropagation();
            void this.toggle(record.node);
        });
        row.addEventListener("click", e => {
            if ((e.target as HTMLElement).closest(".ide-tree-row-actions")) return;
            this.selectRecord(record, true);
        });
        row.addEventListener("dblclick", e => {
            if ((e.target as HTMLElement).closest(".ide-tree-row-actions, .ide-tree-caret")) return;
            this.activate(record);
        });
        row.addEventListener("keydown", e => this.onKeydown(e, record));
        row.addEventListener("contextmenu", e => {
            e.preventDefault();
            this.selectRecord(record, true);
            if (this.options.contextMenu) ContextMenuElement.open(e.x, e.y, this.options.contextMenu, e);
        });

        this.records.set(record.id, record);
        this.renderRecord(record);
        return record;
    }

    private renderRecord(record: TreeRecord<T>) {
        const node = record.node;
        const group = this.model.isGroup(node);

        record.li.className = "ide-tree-item " + (group ? "group" : "leaf");
        const extraClass = this.options.getClassName?.(node);
        if (extraClass) record.li.classList.add(...extraClass.split(" ").filter(Boolean));
        record.li.classList.toggle("expanded", this.expanded.has(record));
        if (group) record.li.setAttribute("aria-expanded", String(this.expanded.has(record)));
        else record.li.removeAttribute("aria-expanded");

        record.row.classList.toggle("selected", this.selected === record);
        record.row.draggable = this.options.canDrag?.(node) ?? false;
        record.caret.innerHTML = group ? `<i class="fa-solid fa-chevron-right"></i>` : "";
        this.renderIcon(record);

        if (this.options.renderLabel) {
            record.label.innerHTML = "";
            this.options.renderLabel(node, record.label);
        } else {
            record.label.textContent = this.model.getLabel(node);
        }

        record.decorations.innerHTML = "";
        this.options.decorate?.(node, record.decorations);

        record.actionComponents.forEach(component => component.dispose());
        record.actionComponents = [];
        record.actions.innerHTML = "";
        for (const action of this.options.rowActions?.(node) ?? []) {
            if (action instanceof UIComponent) {
                this.addChildTo(action, record.actions);
                action.draw();
                record.actionComponents.push(action);
            } else {
                record.actions.appendChild(action);
            }
        }
    }

    private renderIcon(record: TreeRecord<T>) {
        const expanded = this.expanded.has(record);
        const icon = this.options.getIcon
            ? this.options.getIcon(record.node, expanded)
            : this.model.isGroup(record.node)
                ? (expanded ? "fa-regular fa-folder-open" : "fa-regular fa-folder")
                : "fa-regular fa-file";

        record.icon.innerHTML = "";
        record.icon.style.display = icon === null ? "none" : "";
        if (icon instanceof Icon) {
            record.icon.appendChild(icon.toHTML());
        } else if (icon) {
            const element = document.createElement("i");
            element.className = icon;
            record.icon.appendChild(element);
        }
    }

    private ensureChildList(record: TreeRecord<T>): HTMLUListElement {
        if (!record.childList) {
            record.childList = document.createElement("ul");
            record.childList.className = "ide-tree-children";
            record.childList.setAttribute("role", "group");
            record.childList.style.setProperty("--depth", String(record.depth));
            record.li.appendChild(record.childList);
        }
        return record.childList;
    }

    private loadChildren(record: TreeRecord<T>, initial: boolean): Promise<void> {
        if (record.children) return Promise.resolve();
        if (record.loading) return record.loading;

        const list = this.ensureChildList(record);
        const loadingRow = HTMLUtils.createElement<HTMLLIElement>("li.ide-tree-loading", list);
        loadingRow.style.setProperty("--depth", String(record.depth + 1));
        loadingRow.innerHTML = `<i class="fa-solid fa-spinner"></i><span>Loading...</span>`;

        record.loading = (async () => {
            const nodes = await this.model.getChildren(record.node);
            loadingRow.remove();
            record.loading = undefined;
            // Removed while loading
            if (this.records.get(record.id) !== record) return;

            record.children = this.sort(nodes).map(node => this.buildRecord(node, record));
            record.children.forEach(child => list.appendChild(child.li));

            if (initial) await this.applyInitialExpansion(record.children);
        })();
        return record.loading;
    }

    private expandRecord(record: TreeRecord<T>): Promise<void> {
        if (!this.model.isGroup(record.node)) return Promise.resolve();
        if (this.expanded.has(record)) return record.loading ?? Promise.resolve();

        this.expanded.add(record);
        record.li.classList.add("expanded");
        record.li.setAttribute("aria-expanded", "true");
        this.renderIcon(record);
        this.options.onToggle?.(record.node, true);

        // The group shows a loading row right away; its children appear once loaded
        return this.loadChildren(record, true);
    }

    private collapseRecord(record: TreeRecord<T>) {
        if (!this.expanded.delete(record)) return;

        record.li.classList.remove("expanded");
        record.li.setAttribute("aria-expanded", "false");
        this.renderIcon(record);

        // The selection would be hidden: move it to the collapsed group
        if (this.selected && this.isAncestor(record, this.selected)) {
            this.selectRecord(record, this.getUnderlyingElement().contains(document.activeElement));
        }
        this.options.onToggle?.(record.node, false);
    }

    private selectRecord(record: TreeRecord<T>, focus: boolean) {
        if (this.selected !== record) {
            if (this.selected) {
                this.selected.row.classList.remove("selected");
                this.selected.row.tabIndex = -1;
                this.markSelectionPath(this.selected, false);
            }
            this.selected = record;
            record.row.classList.add("selected");
            this.markSelectionPath(record, true);
            this.options.onSelect?.(record.node);
        }

        record.row.tabIndex = 0;
        if (focus) record.row.focus({preventScroll: true});
        record.row.scrollIntoView({block: "nearest"});
    }

    private markSelectionPath(record: TreeRecord<T>, selected: boolean) {
        for (let parent = record.parent; parent; parent = parent.parent) {
            parent.li.classList.toggle("contains-selection", selected);
        }
    }

    private activate(record: TreeRecord<T>) {
        if (this.model.isGroup(record.node)) void this.toggle(record.node);
        else this.options.onOpen?.(record.node);
    }

    private onKeydown(e: KeyboardEvent, record: TreeRecord<T>) {
        if (e.target !== record.row) return;

        this.options.onKeydown?.(e, record.node);
        if (e.defaultPrevented) return;

        const group = this.model.isGroup(record.node);
        const visible = this.visibleRecords();
        const index = visible.indexOf(record);

        switch (e.key) {
            case "ArrowDown":
                if (visible[index + 1]) this.selectRecord(visible[index + 1], true);
                break;
            case "ArrowUp":
                if (visible[index - 1]) this.selectRecord(visible[index - 1], true);
                break;
            case "Home":
                if (visible[0]) this.selectRecord(visible[0], true);
                break;
            case "End":
                if (visible.length) this.selectRecord(visible[visible.length - 1], true);
                break;
            case "ArrowRight":
                if (group && !this.expanded.has(record)) void this.expandRecord(record);
                else if (group && record.children?.length) this.selectRecord(record.children[0], true);
                break;
            case "ArrowLeft":
                if (group && this.expanded.has(record)) this.collapseRecord(record);
                else if (record.parent) this.selectRecord(record.parent, true);
                break;
            case "Enter":
            case " ":
                this.activate(record);
                break;
            default:
                return;
        }
        e.preventDefault();
    }

    private visibleRecords(): TreeRecord<T>[] {
        const result: TreeRecord<T>[] = [];
        const visit = (records: TreeRecord<T>[]) => {
            for (const record of records) {
                result.push(record);
                if (this.expanded.has(record) && record.children) visit(record.children);
            }
        };
        visit(this.roots);
        return result;
    }

    private isAncestor(ancestor: TreeRecord<T>, record: TreeRecord<T>): boolean {
        for (let parent = record.parent; parent; parent = parent.parent) {
            if (parent === ancestor) return true;
        }
        return false;
    }

    private sort(nodes: T[]): T[] {
        return this.options.compare ? [...nodes].sort(this.options.compare) : [...nodes];
    }

    private sortedIndex(records: TreeRecord<T>[], node: T): number {
        const compare = this.options.compare;
        if (!compare) return records.length;

        let lo = 0, hi = records.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (compare(records[mid].node, node) < 0) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }

    private updateEmptyState() {
        this.rootList.querySelector(":scope > .ide-tree-empty")?.remove();
        if (this.roots.length === 0) {
            HTMLUtils.createElement("li.ide-tree-empty", this.rootList).textContent = this.options.emptyText ?? "Nothing to show";
        }
    }

    private cleanup(record: TreeRecord<T>) {
        record.children?.forEach(child => this.cleanup(child));
        record.actionComponents.forEach(component => component.dispose());
        record.unregisterContext();

        this.records.delete(record.id);
        this.expanded.delete(record);
        if (this.selected === record) this.selected = null;
    }

    private clearRecords() {
        this.roots.forEach(record => this.cleanup(record));
        this.roots = [];
        this.selected = null;
    }
}
