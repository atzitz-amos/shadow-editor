import {Persisted} from "../../../../core/persistence/objects/Persisted";

export type SynSuiteSelection = { kind: "test", id: string } | { kind: "group", path: string };

export type SynSuiteFilter = "all" | "failing" | "passed" | "idle";

export type SynSuiteDetailTabId = "code" | "tree" | "inspections" | "timings";

export type SynSuiteStateChange = "selection" | "filter" | "search" | "tab";

/**
 * What the SynSuite window shows: the selection, the filters and the detail tab. The filter and the tab are
 * remembered from one opening to the next.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteWindowState {
    @Persisted
    private static accessor lastFilter: SynSuiteFilter = "all";

    @Persisted
    private static accessor lastTab: SynSuiteDetailTabId = "inspections";

    private selection: SynSuiteSelection | null = null;
    private search: string = "";
    private readonly listeners: ((change: SynSuiteStateChange) => void)[] = [];

    static sameSelection(a: SynSuiteSelection | null, b: SynSuiteSelection | null): boolean {
        if (a === null || b === null) return a === b;
        return a.kind === "test" ? b.kind === "test" && a.id === b.id : b.kind === "group" && a.path === b.path;
    }

    onChange(listener: (change: SynSuiteStateChange) => void): void {
        this.listeners.push(listener);
    }

    dispose(): void {
        this.listeners.length = 0;
    }

    getSelection(): SynSuiteSelection | null {
        return this.selection;
    }

    select(selection: SynSuiteSelection | null): void {
        if (SynSuiteWindowState.sameSelection(this.selection, selection)) return;
        this.selection = selection;
        this.emit("selection");
    }

    getFilter(): SynSuiteFilter {
        return SynSuiteWindowState.lastFilter;
    }

    setFilter(filter: SynSuiteFilter): void {
        if (filter === SynSuiteWindowState.lastFilter) return;
        SynSuiteWindowState.lastFilter = filter;
        this.emit("filter");
    }

    getSearch(): string {
        return this.search;
    }

    setSearch(search: string): void {
        search = search.trim();
        if (search === this.search) return;
        this.search = search;
        this.emit("search");
    }

    /** Whether some tests are hidden by the filter or the search */
    isFiltering(): boolean {
        return this.getFilter() !== "all" || this.search !== "";
    }

    getTab(): SynSuiteDetailTabId {
        return SynSuiteWindowState.lastTab;
    }

    setTab(tab: SynSuiteDetailTabId): void {
        if (tab === SynSuiteWindowState.lastTab) return;
        SynSuiteWindowState.lastTab = tab;
        this.emit("tab");
    }

    private emit(change: SynSuiteStateChange) {
        this.listeners.forEach(listener => listener(change));
    }
}
