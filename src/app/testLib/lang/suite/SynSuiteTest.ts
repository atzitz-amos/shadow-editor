/**
 * A SynSuite test case: a piece of code together with the tree and inspections it is expected to produce.
 * Test cases are plain objects so that they can be persisted as is, see {@link SynSuiteTestStore}.
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export type SynSuiteTest = {
    id: string,
    name: string,
    /**
     * Dotted path of the group containing the test, e.g. "js.parser.statements", or "" for the root.
     * Tests persisted before groups existed have none and belong to the root.
     */
    group?: string,
    description: string,
    /** Key of the language the code is parsed with, see {@link LanguageBase.getKey()} */
    language: string,
    code: string,
    options: SynSuiteTestOptions,
    expected: SynSuiteSnapshot,
    createdAt: number,
    updatedAt: number
}

export type SynSuiteTestOptions = {
    includeInspections: boolean,
    /** Ids of the plugins whose inspections run on the test, see {@link EditorPlugin.getId()} */
    pluginIds: string[]
}

/**
 * What a test case produces once lexed, parsed and analysed.
 */
export type SynSuiteSnapshot = {
    tree: string,
    inspections: SynSuiteInspection[]
}

export type SynSuiteInspection = {
    inspectionId: string,
    /** Id of the plugin defining the inspection, null for built-in inspections */
    pluginId: string | null,
    message: string,
    range: { start: number, end: number }
}

/**
 * Options remembered from one snapshot to the next.
 */
export type SynSuiteSnapshotDefaults = {
    includeInspections: boolean,
    /** null to include the inspections of every plugin */
    pluginIds: string[] | null,
    /** Group the last test was created in */
    group?: string
}

/**
 * Helpers for the dotted group paths: "js.parser.statements" is the group "statements" in "js.parser".
 */
export class SynSuiteGroups {
    public static readonly ROOT = "";
    private static readonly SEGMENT = /^[A-Za-z0-9_$-]+$/;

    public static of(test: SynSuiteTest): string {
        return test.group ?? SynSuiteGroups.ROOT;
    }

    /** "js.parser" + "IfStatement" → "js.parser.IfStatement" */
    public static join(group: string, name: string): string {
        return group === SynSuiteGroups.ROOT ? name : group + "." + name;
    }

    public static parent(group: string): string {
        const index = group.lastIndexOf(".");
        return index === -1 ? SynSuiteGroups.ROOT : group.slice(0, index);
    }

    public static lastSegment(group: string): string {
        return group.slice(group.lastIndexOf(".") + 1);
    }

    /** "js.parser.statements" → ["js", "js.parser", "js.parser.statements"] */
    public static withAncestors(group: string): string[] {
        if (group === SynSuiteGroups.ROOT) return [];
        const segments = group.split(".");
        return segments.map((_, i) => segments.slice(0, i + 1).join("."));
    }

    /** Whether the group is the given one or inside it */
    public static isWithin(group: string, ancestor: string): boolean {
        return ancestor === SynSuiteGroups.ROOT || group === ancestor || group.startsWith(ancestor + ".");
    }

    public static isValidSegment(segment: string): boolean {
        return SynSuiteGroups.SEGMENT.test(segment);
    }

    /** A valid non root path: segments made of letters, digits, _, $ and -, separated by dots */
    public static isValid(group: string): boolean {
        return group !== SynSuiteGroups.ROOT && group.split(".").every(SynSuiteGroups.isValidSegment);
    }
}
