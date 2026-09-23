import {UIComponentMixin} from "../../engine/components/UIComponent";
import {Focusable} from "../../engine/mixins/Focusable";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {ProjectDirectory} from "../../../project/filesystem/tree/ProjectDirectory";
import {FileSystemEntry} from "../../../project/filesystem/tree/FileSystemEntry";
import {EventBus} from "../../../events/EventBus";
import {FileCreatedEvent} from "../../../project/events/FileCreatedEvent";
import {DirectoryCreatedEvent} from "../../../project/events/DirectoryCreatedEvent";
import {GlobalState} from "../../../global/GlobalState";
import {ProjectFile} from "../../../project/filesystem/tree/ProjectFile";
import {ContextMenu, ContextMenuElement} from "../menu/impl/ContextMenu";
import {ContextResolver} from "../../../keybinds/context/ContextResolver";
import {CommonDataKeys} from "../../../keybinds/context/data/CommonDataKeys";
import {EntryRenamedEvent} from "../../../project/events/EntryRenamedEvent";
import {EntryDeletedEvent} from "../../../project/events/EntryDeletedEvent";

type FileSystemTreeOptions = {
    comparer?: (a: FileSystemEntry, b: FileSystemEntry) => number;
    onKeydown?: (event: KeyboardEvent, entry: FileSystemEntry) => void;
    onEntrySelect?: (file: FileSystemEntry) => void;
    onFileOpened?: (file: ProjectFile) => void;

    contextMenu?: ContextMenu;
}

const defaultCompare = (a: FileSystemEntry, b: FileSystemEntry): number => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
    return a.getName().localeCompare(b.getName(), undefined, {numeric: true, sensitivity: 'base'});
};

interface NodeRecord {
    entry: FileSystemEntry;
    li: HTMLLIElement;
    row: HTMLElement;
    label: HTMLElement;
    childList?: HTMLUListElement;
    childRecords?: NodeRecord[];
    loading?: boolean;
}

/**
 *
 * @author Atzitz Amos
 * @date 8/7/2026
 * @since 1.0.0
 */
export class FileSystemTree extends UIComponentMixin(Focusable) {
    private readonly eventBus: EventBus = GlobalState.getMainEventBus();

    private readonly compare: (a: FileSystemEntry, b: FileSystemEntry) => number;

    /** Looked up by CURRENT entry reference; re-keyed in place on rename. */
    private records = new Map<string, NodeRecord>();
    private expandedRecords = new Set<NodeRecord>();
    private selectedRecord: NodeRecord | null = null;
    private rootRecord!: NodeRecord;

    constructor(parentEl: HTMLElement, private readonly rootDirectory: ProjectDirectory, private readonly options: FileSystemTreeOptions = {}) {
        super(HTMLUtils.createDiv("project-tree", parentEl));
        this.compare = options.comparer ?? defaultCompare;
    }

    async draw(): Promise<void> {
        const treeUl = document.createElement("ul");
        treeUl.className = "fst-tree";
        treeUl.setAttribute("role", "tree");

        this.rootRecord = this.buildRecord(this.rootDirectory);
        treeUl.appendChild(this.rootRecord.li);
        this.getUnderlyingElement().appendChild(treeUl);

        // Root starts expanded so there's something to look at.
        await this.expand(this.rootRecord);
        this.selectRecord(this.rootRecord);

        this.subscribeToFsEvents();
    }

    /** Stops listening on the event bus. Call before this component is discarded. */
    dispose(): void {
        this.eventBus.unsubscribe(this, FileCreatedEvent.SUBSCRIBER);
        this.eventBus.unsubscribe(this, DirectoryCreatedEvent.SUBSCRIBER);
        this.eventBus.unsubscribe(this, EntryDeletedEvent.SUBSCRIBER);
        this.eventBus.unsubscribe(this, EntryRenamedEvent.SUBSCRIBER);
    }

    async toggle(record: NodeRecord): Promise<void> {
        if (!record.entry.isDirectory()) return;
        if (this.expandedRecords.has(record)) {
            this.collapse(record);
        } else {
            await this.expand(record);
        }
    }

    public isExpanded(directory: ProjectDirectory): boolean {
        const record = this.records.get(directory.getId());
        return record ? this.expandedRecords.has(record) : false;
    }

    public setExpanded(directory: ProjectDirectory): void {
        const record = this.records.get(directory.getId());
        if (!record || this.expandedRecords.has(record)) return;

        void this.expand(record);
    }

    public select(entry: FileSystemEntry): void {
        const record = this.records.get(entry.getId());
        if (record) this.selectRecord(record);
    }

    // ---- row construction ----------------------------------------------
    // Built once with createElement, never rebuilt via innerHTML -- every
    // later mutation (insert/delete/rename/expand) patches this exact DOM.

    setFileOpenedHandler(handler: (entry: ProjectFile) => void) {
        this.options.onFileOpened = handler;
    }

    setEntrySelectedHandler(handler: (entry: FileSystemEntry) => void) {
        this.options.onEntrySelect = handler;
    }

    setContextMenu(contextMenu: ContextMenu) {
        this.options.contextMenu = contextMenu;
    }

    setKeydownHandler(callback: (event: KeyboardEvent, entry: FileSystemEntry) => void) {
        this.options.onKeydown = callback;
    }

    // ---- expand / collapse ---------------------------------------------
    // Collapsing is a pure CSS toggle (children stay in the DOM, just
    // hidden) -- it never discards state. Expanding fetches children
    // exactly once per folder, on first open.

    private subscribeToFsEvents(): void {
        this.eventBus.subscribe(this, FileCreatedEvent.SUBSCRIBER, (e) => this.handleEntryCreated(e.getEntry()));
        this.eventBus.subscribe(this, DirectoryCreatedEvent.SUBSCRIBER, (e) => this.handleEntryCreated(e.getEntry()));
        this.eventBus.subscribe(this, EntryDeletedEvent.SUBSCRIBER, (e) => this.handleEntryDeleted(e.getEntry()));
        this.eventBus.subscribe(this, EntryRenamedEvent.SUBSCRIBER, (e) => this.handleEntryRenamed(e.getEntry()));
    }

    private buildRecord(entry: FileSystemEntry): NodeRecord {
        const isDir = entry.isDirectory();

        const li = document.createElement("li");
        li.className = "tree-item";
        li.setAttribute("role", "treeitem");

        const row = document.createElement("div");
        row.className = isDir ? "tree-item-header" : "tree-item-file-header";
        row.tabIndex = -1;

        if (isDir) {
            const caret = document.createElement("span");
            caret.className = "tree-caret";
            const caretIcon = document.createElement("i");
            caretIcon.className = "fa-solid fa-chevron-down";
            caret.appendChild(caretIcon);
            row.appendChild(caret);

            caret.addEventListener("click", (e) => {
                e.preventDefault();
                void this.toggle(this.records.get(entry.getId())!);
            });
        }

        const icon = document.createElement("i");
        icon.className = isDir
            ? "fa-regular fa-folder-open tree-icon folder"
            : "fa-regular fa-file tree-icon file";
        row.appendChild(icon);

        const label = document.createElement("span");
        label.className = "tree-name";
        label.textContent = entry.getName();
        row.appendChild(label);

        li.appendChild(row);

        const record: NodeRecord = {entry, li, row, label};
        ContextResolver.register(row, {
            provide: key => key === CommonDataKeys.PROJECT_ENTRY
                ? entry
                : key === CommonDataKeys.PROJECT_FILE && entry.isFile()
                    ? entry
                    : key === CommonDataKeys.PROJECT_FILES && entry.isFile()
                        ? [entry]
                        : key === CommonDataKeys.FILES_TREE
                            ? this
                            : undefined
        });

        row.addEventListener("click", (e) => {
            e.stopPropagation();
            this.selectRecord(record);
        })

        row.addEventListener("dblclick", (e) => {
            e.stopPropagation();
            this.selectRecord(record);
            if (record.entry.isDirectory()) {
                void this.toggle(record);
            } else {
                this.options.onFileOpened?.(record.entry as ProjectFile);
            }
        });
        row.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                this.selectRecord(record);
                if (record.entry.isDirectory()) void this.toggle(record);
                else this.options.onFileOpened?.(record.entry as ProjectFile);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                this.selectRelative(record, -1);
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                this.selectRelative(record, 1);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                this.selectLeftBehavior(record);
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                void this.selectRightBehavior(record);
            } else {
                this.options.onKeydown?.(e, record.entry);
            }
        });

        row.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.selectRecord(record);

            if (this.options.contextMenu)
                ContextMenuElement.open(e.x, e.y, this.options.contextMenu, e)
        })

        this.records.set(entry.getId(), record);
        return record;
    }

    private sortedIndex(records: NodeRecord[], entry: FileSystemEntry): number {
        let lo = 0, hi = records.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (this.compare(records[mid].entry, entry) < 0) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }

    private collapse(record: NodeRecord): void {
        this.expandedRecords.delete(record);
        record.li.classList.remove("expanded");
        record.li.setAttribute("aria-expanded", "false");
    }

    private async expand(record: NodeRecord): Promise<void> {
        if (!record.entry.isDirectory()) return;

        if (!record.childList) {
            record.childList = document.createElement("ul");
            record.childList.className = "tree-item-children";
            record.childList.setAttribute("role", "group");
            record.li.appendChild(record.childList);
        }

        if (!record.childRecords && !record.loading) {
            record.loading = true;
            this.showLoadingRow(record.childList);

            const children = await record.entry.getChildren();

            record.loading = false;
            record.childList.innerHTML = ""; // only the loading placeholder; safe to clear

            const sorted = [...children].sort(this.compare);
            record.childRecords = sorted.map((child) => {
                const childRecord = this.buildRecord(child);
                record.childList!.appendChild(childRecord.li);
                return childRecord;
            });
        }

        this.expandedRecords.add(record);
        record.li.classList.add("expanded");
        record.li.setAttribute("aria-expanded", "true");
    }

    // ---- fs event handlers -----------------------------------------
    // Each of these only ever touches a folder's DOM if that folder has
    // already been expanded at least once (`childRecords` set) -- an
    // unexpanded folder is left alone entirely, so a background change can
    // never force it open. None of this ever touches `expandedRecords`.

    private showLoadingRow(childList: HTMLUListElement): void {
        const li = document.createElement("li");
        li.className = "tree-loading";
        const spinner = document.createElement("i");
        spinner.className = "fa-solid fa-spinner";
        li.append(spinner, document.createTextNode(" Loading..."));
        childList.appendChild(li);
    }

    private selectRecord(record: NodeRecord): void {
        this.selectedRecord?.row.classList.remove("selected");
        this.selectedRecord = record;
        record.row.classList.add("selected");
        record.row.focus();

        this.options.onEntrySelect?.(record.entry);
    }

    private flattenVisibleRecords(): NodeRecord[] {
        const result: NodeRecord[] = [];

        const visit = (record: NodeRecord) => {
            result.push(record);
            if (record.entry.isDirectory() && this.expandedRecords.has(record) && record.childRecords?.length) {
                for (const child of record.childRecords) visit(child);
            }
        };

        visit(this.rootRecord);
        return result;
    }

    private selectRelative(record: NodeRecord, delta: number): void {
        const visible = this.flattenVisibleRecords();
        const current = visible.indexOf(record);
        if (current === -1) return;

        const target = current + delta;
        if (target < 0 || target >= visible.length) return;

        this.selectRecord(visible[target]);
    }

    private selectLeftBehavior(record: NodeRecord): void {
        if (record.entry.isDirectory() && this.expandedRecords.has(record)) {
            this.collapse(record);
            return;
        }

        this.selectRelative(record, -1);
    }

    private async selectRightBehavior(record: NodeRecord): Promise<void> {
        if (record.entry.isDirectory()) {
            if (!this.expandedRecords.has(record)) {
                await this.expand(record);
                return;
            }

            if (record.childRecords && record.childRecords.length > 0) {
                this.selectRecord(record.childRecords[0]);
                return;
            }
        }

        let current: NodeRecord | undefined = record;

        while (current) {
            const parent = current.entry.getParent();
            if (!parent) return;

            const parentRecord = this.records.get(parent.getId());
            const siblings = parentRecord?.childRecords;
            if (!siblings || siblings.length === 0) return;

            const index = siblings.indexOf(current);
            if (index === -1) return;

            const nextSibling = siblings[index + 1];
            if (nextSibling) {
                this.selectRecord(nextSibling);
                return;
            }

            current = parentRecord;
        }
    }

    private handleEntryCreated(entry: FileSystemEntry): void {
        const parent = entry.getParent();
        if (!parent) return; // the root itself -- nothing to do

        const parentRecord = this.records.get(parent.getId());
        if (!parentRecord?.childRecords || !parentRecord.childList) return;

        const idx = this.sortedIndex(parentRecord.childRecords, entry);
        const childRecord = this.buildRecord(entry);
        parentRecord.childRecords.splice(idx, 0, childRecord);

        const ref = parentRecord.childList.children[idx] ?? null;
        parentRecord.childList.insertBefore(childRecord.li, ref as ChildNode | null);
    }

    private handleEntryDeleted(entry: FileSystemEntry): void {
        const record = this.records.get(entry.getId());
        if (!record) return;

        const parent = entry.getParent();
        const parentRecord = parent ? this.records.get(parent.getId()) : undefined;
        if (parentRecord?.childRecords) {
            parentRecord.childRecords = parentRecord.childRecords.filter((r) => r !== record);
        }

        record.li.remove();
        this.cleanup(record);
    }

    private cleanup(record: NodeRecord): void {
        if (record.childRecords) {
            for (const child of record.childRecords) this.cleanup(child);
        }
        this.records.delete(record.entry.getId());
        this.expandedRecords.delete(record);
        if (this.selectedRecord === record) this.selectedRecord = null;
    }

    /**
     * `renamed` may not be `previous` -- see the NodeRecord doc comment.
     * The DOM row and its NodeRecord stay exactly where they are; only the
     * entry reference behind them (and the map key) is swapped.
     */
    private handleEntryRenamed(entry: FileSystemEntry): void {
        const record = this.records.get(entry.getId());
        if (!record) return;

        record.label.textContent = entry.getName();

        const parent = entry.getParent();
        const parentRecord = parent ? this.records.get(parent.getId()) : undefined;
        if (!parentRecord?.childRecords || !parentRecord.childList) return;

        parentRecord.childRecords = parentRecord.childRecords.filter((r) => r !== record);
        const idx = this.sortedIndex(parentRecord.childRecords, entry);
        parentRecord.childRecords.splice(idx, 0, record);

        // Move the SAME <li> (don't rebuild it), so an expanded subtree
        // underneath a renamed directory survives untouched.
        record.li.remove();
        const ref = parentRecord.childList.children[idx] ?? null;
        parentRecord.childList.insertBefore(record.li, ref as ChildNode | null);
    }
}