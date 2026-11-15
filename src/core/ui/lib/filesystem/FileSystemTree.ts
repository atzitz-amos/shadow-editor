import {ProjectDirectory} from "../../../project/filesystem/tree/ProjectDirectory";
import {FileSystemEntry} from "../../../project/filesystem/tree/FileSystemEntry";
import {EventBus} from "../../../events/EventBus";
import {FileCreatedEvent} from "../../../project/events/FileCreatedEvent";
import {BinaryFileCreatedEvent} from "../../../project/events/BinaryFileCreatedEvent";
import {DirectoryCreatedEvent} from "../../../project/events/DirectoryCreatedEvent";
import {GlobalState} from "../../../global/GlobalState";
import {ProjectFile} from "../../../project/filesystem/tree/ProjectFile";
import {ContextMenu} from "../menu/impl/ContextMenu";
import {CommonDataKeys} from "../../../keybinds/context/data/CommonDataKeys";
import {EntryRenamedEvent} from "../../../project/events/EntryRenamedEvent";
import {EntryDeletedEvent} from "../../../project/events/EntryDeletedEvent";
import {IdeTree} from "../tree/IdeTree";
import {IdeTreeModel} from "../tree/IdeTreeModel";

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

class FileSystemTreeModel implements IdeTreeModel<FileSystemEntry> {
    constructor(private readonly root: ProjectDirectory) {
    }

    getId(entry: FileSystemEntry): string {
        return entry.getId();
    }

    getRoots(): FileSystemEntry[] {
        return [this.root];
    }

    isGroup(entry: FileSystemEntry): boolean {
        return entry.isDirectory();
    }

    async getChildren(entry: FileSystemEntry): Promise<FileSystemEntry[]> {
        return await (entry as ProjectDirectory).getChildren();
    }

    getLabel(entry: FileSystemEntry): string {
        return entry.getName();
    }
}

/**
 * {@link IdeTree} of a project directory, kept in sync with the file system events.
 *
 * @author Atzitz Amos
 * @date 8/7/2026
 * @since 1.0.0
 */
export class FileSystemTree extends IdeTree<FileSystemEntry> {
    private readonly eventBus: EventBus = GlobalState.getMainEventBus();

    constructor(parentEl: HTMLElement, private readonly rootDirectory: ProjectDirectory, fsOptions: FileSystemTreeOptions = {}) {
        super(parentEl, new FileSystemTreeModel(rootDirectory), {
            className: "project-tree",
            indentGuides: false,
            compare: fsOptions.comparer ?? defaultCompare,
            getIcon: (entry, expanded) => entry.isDirectory()
                ? (expanded ? "fa-regular fa-folder-open" : "fa-regular fa-folder")
                : "fa-regular fa-file",
            // The root starts expanded so there's something to look at
            isInitiallyExpanded: (_, depth) => depth === 0,
            contextMenu: fsOptions.contextMenu,
            onKeydown: fsOptions.onKeydown,
            onSelect: entry => entry && fsOptions.onEntrySelect?.(entry),
            // Binary files are leaves too, but there is nothing to open them in
            onOpen: entry => entry.isFile() && fsOptions.onFileOpened?.(entry)
        });

        this.setOptions({
            provideData: (entry, key) => key === CommonDataKeys.PROJECT_ENTRY
                ? entry
                : key === CommonDataKeys.PROJECT_FILE && entry.isFile()
                    ? entry
                    : key === CommonDataKeys.PROJECT_FILES && entry.isFile()
                        ? [entry]
                        : key === CommonDataKeys.FILES_TREE
                            ? this
                            : undefined
        });
    }

    async draw(): Promise<void> {
        await super.draw();
        // Disposed while loading: subscribing now would leak this tree on the event bus
        if (this.isDisposed()) return;
        this.select(this.rootDirectory);

        this.subscribeToFsEvents();
    }

    /** Stops listening on the event bus. Call before this component is discarded. */
    dispose(): void {
        this.unsubscribeFromFsEvents();
        super.dispose();
    }

    public setExpanded(directory: ProjectDirectory): void {
        void this.expand(directory);
    }

    setFileOpenedHandler(handler: (entry: ProjectFile) => void) {
        this.setOptions({onOpen: entry => entry.isFile() && handler(entry)});
    }

    setEntrySelectedHandler(handler: (entry: FileSystemEntry) => void) {
        this.setOptions({onSelect: entry => entry && handler(entry)});
    }

    setContextMenu(contextMenu: ContextMenu) {
        this.setOptions({contextMenu});
    }

    setKeydownHandler(callback: (event: KeyboardEvent, entry: FileSystemEntry) => void) {
        this.setOptions({onKeydown: callback});
    }

    // ---- fs event handlers -----------------------------------------
    // Only folders whose children were already loaded are touched, so a background
    // change can never force a folder open.

    private subscribeToFsEvents(): void {
        this.unsubscribeFromFsEvents();
        this.eventBus.subscribe(this, FileCreatedEvent.SUBSCRIBER, (e) => this.handleEntryCreated(e.getEntry()));
        this.eventBus.subscribe(this, BinaryFileCreatedEvent.SUBSCRIBER, (e) => this.handleEntryCreated(e.getEntry()));
        this.eventBus.subscribe(this, DirectoryCreatedEvent.SUBSCRIBER, (e) => this.handleEntryCreated(e.getEntry()));
        this.eventBus.subscribe(this, EntryDeletedEvent.SUBSCRIBER, (e) => this.remove(e.getEntry()));
        this.eventBus.subscribe(this, EntryRenamedEvent.SUBSCRIBER, (e) => this.update(e.getEntry()));
    }

    private unsubscribeFromFsEvents(): void {
        this.eventBus.unsubscribe(this, FileCreatedEvent.SUBSCRIBER);
        this.eventBus.unsubscribe(this, BinaryFileCreatedEvent.SUBSCRIBER);
        this.eventBus.unsubscribe(this, DirectoryCreatedEvent.SUBSCRIBER);
        this.eventBus.unsubscribe(this, EntryDeletedEvent.SUBSCRIBER);
        this.eventBus.unsubscribe(this, EntryRenamedEvent.SUBSCRIBER);
    }

    private handleEntryCreated(entry: FileSystemEntry): void {
        const parent = entry.getParent();
        if (parent) this.insert(parent, entry);
    }
}
