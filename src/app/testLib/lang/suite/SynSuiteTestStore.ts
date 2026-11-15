import {Persisted} from "../../../../core/persistence/objects/Persisted";
import {GlobalState} from "../../../../core/global/GlobalState";
import {SynSuiteGroups, SynSuiteSnapshotDefaults, SynSuiteTest} from "./SynSuiteTest";
import {SynSuiteTestsChangedEvent} from "./events/SynSuiteTestsChangedEvent";

/**
 * Persisted storage of the SynSuite test cases and of the options remembered between snapshots.
 * <p>
 * Stored tests are treated as immutable: every modification replaces the whole test case, which is
 * what triggers its persistence.
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class SynSuiteTestStore {
    @Persisted
    private static accessor tests: Map<string, SynSuiteTest> = new Map<string, SynSuiteTest>();

    /**
     * Groups created explicitly, so that they exist before containing any test. The groups of the tests are
     * implied and not necessarily listed here.
     */
    @Persisted
    private static accessor groups: string[] = [];

    /** Whether the tests of the first version of SynSuite were already looked for, see SynSuiteLegacyImporter */
    @Persisted
    private static accessor legacyImportDone: boolean = false;

    @Persisted
    private static accessor snapshotDefaults: SynSuiteSnapshotDefaults = {
        includeInspections: true,
        pluginIds: null
    };

    private static readonly instance: SynSuiteTestStore = new SynSuiteTestStore();

    private constructor() {
    }

    public static getInstance(): SynSuiteTestStore {
        return this.instance;
    }

    /**
     * @returns every test case, oldest first
     */
    public getAll(): SynSuiteTest[] {
        return [...SynSuiteTestStore.tests.values()].sort((a, b) => a.createdAt - b.createdAt);
    }

    public get(id: string): SynSuiteTest | null {
        return SynSuiteTestStore.tests.get(id) ?? null;
    }

    public find(group: string, name: string): SynSuiteTest | null {
        return this.getAll().find(test => SynSuiteGroups.of(test) === group && test.name === name) ?? null;
    }

    /**
     * @param recursive whether to include the tests of the subgroups
     */
    public getTestsIn(group: string, recursive: boolean = false): SynSuiteTest[] {
        return this.getAll().filter(test => recursive
            ? SynSuiteGroups.isWithin(SynSuiteGroups.of(test), group)
            : SynSuiteGroups.of(test) === group);
    }

    // ---- groups ----

    /**
     * @returns every group, created explicitly or containing tests, with their ancestors, sorted
     */
    public getGroups(): string[] {
        const groups = new Set<string>();
        const add = (group: string) => SynSuiteGroups.withAncestors(group).forEach(g => groups.add(g));

        SynSuiteTestStore.groups.forEach(add);
        SynSuiteTestStore.tests.forEach(test => add(SynSuiteGroups.of(test)));
        return [...groups].sort();
    }

    /**
     * @returns the direct subgroups of the group ({@link SynSuiteGroups.ROOT} for the top-level groups)
     */
    public getSubgroups(group: string): string[] {
        return this.getGroups().filter(g => g !== group && SynSuiteGroups.parent(g) === group);
    }

    public hasGroup(group: string): boolean {
        return group === SynSuiteGroups.ROOT || this.getGroups().includes(group);
    }

    /**
     * Creates the group and its missing ancestors.
     */
    public addGroup(group: string): void {
        if (!SynSuiteGroups.isValid(group)) throw new Error(`Invalid SynSuite group '${group}'`);
        if (this.hasGroup(group)) return;

        SynSuiteTestStore.groups = [...SynSuiteTestStore.groups, group];
        this.notifyChanged(null);
    }

    /**
     * Removes an empty group with its subgroups.
     *
     * @returns false if the group or one of its subgroups still contains tests
     */
    public removeGroup(group: string): boolean {
        if (group === SynSuiteGroups.ROOT || this.getTestsIn(group, true).length > 0) return false;

        // Ancestors that were only implied by this group are kept, as an explicit group
        const parent = SynSuiteGroups.parent(group);
        const remaining = SynSuiteTestStore.groups.filter(g => !SynSuiteGroups.isWithin(g, group));
        if (parent !== SynSuiteGroups.ROOT && !remaining.some(g => SynSuiteGroups.isWithin(g, parent))) {
            remaining.push(parent);
        }

        SynSuiteTestStore.groups = remaining;
        this.notifyChanged(null);
        return true;
    }

    /**
     * Moves a group, with its subgroups and their tests, to a path that must not exist yet. The tests keep their
     * modification date: being moved does not make their results outdated.
     */
    public relocateGroup(from: string, to: string): void {
        if (from === SynSuiteGroups.ROOT) throw new Error("The root group cannot be moved");
        const rebase = (group: string) => to + group.slice(from.length);

        for (const test of this.getTestsIn(from, true)) {
            SynSuiteTestStore.tests.set(test.id, {...test, group: rebase(SynSuiteGroups.of(test))});
        }

        const groups = SynSuiteTestStore.groups.map(g => SynSuiteGroups.isWithin(g, from) ? rebase(g) : g);
        if (!groups.includes(to)) groups.push(to);
        SynSuiteTestStore.groups = groups;
        this.keepGroup(SynSuiteGroups.parent(from));

        this.notifyChanged(null);
    }

    /**
     * Changes the group or the name of a test. Unlike {@link update}, this keeps its modification date: being
     * moved or renamed does not make its results outdated.
     *
     * @returns the moved test case, or null if no test has this id
     */
    public relocate(id: string, location: { group?: string, name?: string }): SynSuiteTest | null {
        const existing = SynSuiteTestStore.tests.get(id);
        if (!existing) return null;

        const relocated: SynSuiteTest = {...existing, ...location};
        SynSuiteTestStore.tests.set(id, relocated);
        this.keepGroup(SynSuiteGroups.of(existing));

        this.notifyChanged(id);
        return relocated;
    }

    public add(test: SynSuiteTest): void {
        if (SynSuiteTestStore.tests.has(test.id)) {
            throw new Error(`A SynSuite test with id '${test.id}' already exists`);
        }
        SynSuiteTestStore.tests.set(test.id, test);
        this.notifyChanged(test.id);
    }

    /**
     * Replaces the given fields of a test case. The id and the creation date cannot be modified.
     *
     * @returns the updated test case, or null if no test has this id
     */
    public update(id: string, patch: Partial<Omit<SynSuiteTest, "id" | "createdAt">>): SynSuiteTest | null {
        const existing = SynSuiteTestStore.tests.get(id);
        if (!existing) return null;

        const updated: SynSuiteTest = {...existing, ...patch, id, createdAt: existing.createdAt, updatedAt: Date.now()};
        SynSuiteTestStore.tests.set(id, updated);
        this.notifyChanged(id);
        return updated;
    }

    public remove(id: string): boolean {
        const removed = SynSuiteTestStore.tests.delete(id);
        if (removed) this.notifyChanged(id);
        return removed;
    }

    public clear(): void {
        SynSuiteTestStore.tests.clear();
        this.notifyChanged(null);
    }

    public isLegacyImportDone(): boolean {
        return SynSuiteTestStore.legacyImportDone;
    }

    public markLegacyImportDone(): void {
        SynSuiteTestStore.legacyImportDone = true;
    }

    public getSnapshotDefaults(): SynSuiteSnapshotDefaults {
        return SynSuiteTestStore.snapshotDefaults;
    }

    public setSnapshotDefaults(defaults: SynSuiteSnapshotDefaults): void {
        SynSuiteTestStore.snapshotDefaults = defaults;
    }

    /** Lists the group explicitly if nothing implies it anymore, so that moving its content out keeps it */
    private keepGroup(group: string) {
        if (group === SynSuiteGroups.ROOT) return;
        const implied = SynSuiteTestStore.groups.some(g => SynSuiteGroups.isWithin(g, group))
            || this.getTestsIn(group, true).length > 0;
        if (!implied) SynSuiteTestStore.groups = [...SynSuiteTestStore.groups, group];
    }

    private notifyChanged(testId: string | null) {
        GlobalState.getMainEventBus().syncPublish(new SynSuiteTestsChangedEvent(testId));
    }
}
