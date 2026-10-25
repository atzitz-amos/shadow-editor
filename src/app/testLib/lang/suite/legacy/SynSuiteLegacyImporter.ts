import {Deserializer} from "../../../../../core/persistence/serializable/Deserializer";
import {Serialized} from "../../../../../core/persistence/serializable/Serializable";
import {UUIDHelper} from "../../../../../editor/utils/UUIDHelper";
import {SynSuiteGroups, SynSuiteTest} from "../SynSuiteTest";
import {SynSuiteTestStore} from "../SynSuiteTestStore";

/**
 * A test as persisted by the first version of SynSuite, grouped by plugin.
 */
type LegacyTest = {
    pluginId: string,
    key: string,
    description: string,
    language: string,
    code: string,
    expectedTree: string,
    expectedInspections: {
        inspectionKey: string,
        message: string,
        range: { start: number, end: number }
    }[]
}

export type SynSuiteImportReport = {
    /** Whether old tests were found at all */
    found: boolean,
    imported: number,
    /** Tests already present with the same path */
    skipped: number
}

/**
 * Imports the tests of the first version of SynSuite. They were serialized as JSON in the "value" of the
 * {@link LEGACY_RECORD} record of the {@link LEGACY_STORE} object store, in the {@link LEGACY_DATABASE} database.
 * <p>
 * Dotted keys become groups ("functions.basic" is the test "basic" of the group "functions"), and the inspections
 * are restricted to the plugin the test belonged to. Tests already present are skipped, so importing twice is safe.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteLegacyImporter {
    static readonly LEGACY_DATABASE = "app_db";
    static readonly LEGACY_STORE = "shadow.lang.testSuite";
    static readonly LEGACY_RECORD = "root";

    constructor(private readonly store: SynSuiteTestStore) {
    }

    /**
     * Looks for the old tests in the legacy database and imports them.
     */
    async importFromDatabase(): Promise<SynSuiteImportReport> {
        const raw = await SynSuiteLegacyImporter.readLegacyValue();
        if (raw === undefined) return {found: false, imported: 0, skipped: 0};
        return this.importSerialized(raw);
    }

    /**
     * Imports the old tests from their persisted form: the serialized map, or its JSON text.
     */
    importSerialized(raw: unknown): SynSuiteImportReport {
        const serialized = SynSuiteLegacyImporter.unwrap(raw);
        const byPlugin = new Deserializer().deserializeObject<Map<string, LegacyTest[]>>(serialized);

        const report: SynSuiteImportReport = {found: true, imported: 0, skipped: 0};
        const now = Date.now();

        for (const tests of byPlugin.values()) {
            for (const legacy of tests) {
                const test = SynSuiteLegacyImporter.convert(legacy, now + report.imported);
                if (this.store.find(SynSuiteGroups.of(test), test.name)) {
                    report.skipped++;
                    continue;
                }
                this.store.add(test);
                report.imported++;
            }
        }
        return report;
    }

    private static convert(legacy: LegacyTest, createdAt: number): SynSuiteTest {
        const segments = legacy.key.split(".").map(segment => segment.replace(/[^A-Za-z0-9_$-]/g, "_") || "_");
        const name = segments.pop()!;

        return {
            id: UUIDHelper.newUUID(),
            name,
            group: segments.join("."),
            description: legacy.description ?? "",
            language: legacy.language,
            code: legacy.code,
            options: {includeInspections: true, pluginIds: [legacy.pluginId]},
            expected: {
                tree: legacy.expectedTree,
                inspections: (legacy.expectedInspections ?? []).map(inspection => ({
                    inspectionId: inspection.inspectionKey,
                    pluginId: legacy.pluginId,
                    message: inspection.message,
                    range: {start: inspection.range.start, end: inspection.range.end}
                }))
            },
            createdAt,
            updatedAt: createdAt
        };
    }

    /** The serialized map, whether it was stored as is, as JSON text, or wrapped in a versioned record */
    private static unwrap(raw: unknown): Serialized {
        if (typeof raw === "string") return SynSuiteLegacyImporter.unwrap(JSON.parse(raw));
        if (raw !== null && typeof raw === "object") {
            if ("__type" in raw) return raw as Serialized;
            if ("value" in raw) return SynSuiteLegacyImporter.unwrap((raw as { value: unknown }).value);
        }
        throw new Error("Unrecognized format for the legacy SynSuite tests");
    }

    /**
     * @returns the record of the legacy store, undefined if the legacy database or store does not exist
     */
    private static async readLegacyValue(): Promise<unknown> {
        const databases = await indexedDB.databases?.() ?? [];
        if (!databases.some(database => database.name === SynSuiteLegacyImporter.LEGACY_DATABASE)) return undefined;

        // Opening without a version never upgrades, so the database is left untouched
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open(SynSuiteLegacyImporter.LEGACY_DATABASE);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        try {
            if (!db.objectStoreNames.contains(SynSuiteLegacyImporter.LEGACY_STORE)) return undefined;

            return await new Promise<unknown>((resolve, reject) => {
                const request = db.transaction(SynSuiteLegacyImporter.LEGACY_STORE, "readonly")
                    .objectStore(SynSuiteLegacyImporter.LEGACY_STORE)
                    .get(SynSuiteLegacyImporter.LEGACY_RECORD);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } finally {
            db.close();
        }
    }
}
