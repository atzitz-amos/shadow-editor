import {PersistedClass} from "../../threaded/service/Service";
import {PersistedObject} from "../../persistence/objects/PersistedObject";
import {Deserializer} from "../../persistence/serializable/Deserializer";
import {Serialized} from "../../persistence/serializable/Serializable";
import {Serializer} from "../../persistence/serializable/Serializer";
import {SynSuiteParserTest} from "./SynSuiteParserTest";
import {PersistenceService} from "../../persistence/service/PersistenceService";

/**
 *
 * @author Atzitz Amos
 * @date 6/4/2026
 * @since 1.0.0
 */
@PersistedClass
export class SynSuitePersister implements PersistedObject {
    private static readonly instance = new SynSuitePersister();

    private tests: Map<string, SynSuiteParserTest[]> = new Map<string, SynSuiteParserTest[]>();

    static getInstance(): SynSuitePersister {
        return SynSuitePersister.instance;
    }

    getPersistedKey(): string {
        return "shadow.lang.testSuite";
    }

    persist(serializer: Serializer): Serialized {
        return serializer.serializeMap(this.tests);
    }

    load(deserializer: Deserializer, data: Serialized): void {
        if (data === null) return;
        this.tests = deserializer.deserializeMap(data);
    }

    addTest(pluginId: string, test: SynSuiteParserTest): void {
        if (!this.tests.has(pluginId)) {
            this.tests.set(pluginId, []);
        }
        this.tests.get(pluginId)!.push(test);

        PersistenceService.getInstance().requirePersistence();
    }

    getTests(pluginId: string): SynSuiteParserTest[] {
        return this.tests.get(pluginId) || [];
    }

    getAllTests(): Map<string, SynSuiteParserTest[]> {
        return this.tests;
    }

    clearTestsForPlugin(pluginId: string) {
        if (this.tests.has(pluginId)) {
            this.tests.delete(pluginId);
            PersistenceService.getInstance().requirePersistence();
        }
    }

    patchTest(pluginId: string, testKey: string, patch: Partial<SynSuiteParserTest> | null) {
        if (!this.tests.has(pluginId)) return;
        const pluginTests = this.tests.get(pluginId)!;
        const testIndex = pluginTests.findIndex(test => test.key === testKey);
        if (testIndex === -1) return;

        if (patch) {
            const existingTest = pluginTests[testIndex];
            pluginTests[testIndex] = {
                pluginId,
                key: patch.key ?? existingTest.key,
                description: patch.description ?? existingTest.description,
                language: patch.language ?? existingTest.language,
                code: patch.code ?? existingTest.code,
                expectedTree: patch.expectedTree ?? existingTest.expectedTree,
                expectedInspections: patch.expectedInspections ?? existingTest.expectedInspections
            };
        } else {
            // If patch is null, remove the test
            pluginTests.splice(testIndex, 1);
        }

        PersistenceService.getInstance().requirePersistence();
    }

    clearAllTests() {
        this.tests.clear();
        PersistenceService.getInstance().requirePersistence();
    }
}
