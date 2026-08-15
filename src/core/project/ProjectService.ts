import {Service} from "../threaded/service/Service";
import {Project} from "./Project";
import {UICommonMutators} from "../../app/core/UICommonMutators";
import {UIMutators} from "../ui/engine/listeners/mutators/UIMutators";
import {PersistedObject} from "../persistence/objects/PersistedObject";
import {Serializer} from "../persistence/serializable/Serializer";
import {Serialized} from "../persistence/serializable/Serializable";
import {Deserializer} from "../persistence/serializable/Deserializer";
import {UnsafeFlagsService} from "../sync/flags/UnsafeFlagsService";
import {UnsafeFlags} from "../sync/flags/UnsafeFlags";


/**
 *
 * @author Atzitz Amos
 * @date 4/16/2026
 * @since 1.0.0
 */
@Service
export class ProjectService implements PersistedObject {
    private static readonly instance: ProjectService = new ProjectService();

    @UIMutators.mutates(UICommonMutators.PROJECT_LIST)
    private readonly projects: Map<string, Project> = new Map<string, Project>();

    public static getInstance(): ProjectService {
        return ProjectService.instance;
    }

    public begin() {
    }

    getPersistedKey(): string {
        return "shadow.project.list";
    }

    persist(serializer: Serializer): Serialized {
        return serializer.serializeArray(this.projects.values().toArray());
    }

    load(deserializer: Deserializer, data: Serialized): void {
        if (!data) return;
        deserializer.use(Project, Project.deserializer)

        const projects: Project[] = deserializer.deserializeList(data);
        for (const project of projects) {
            this.projects.set(project.getName(), project);
        }
    }

    getAllProjects(): Project[] {
        return Array.from(this.projects.values());
    }

    persistProject(project: Project): void {
        if (this.projects.has(project.getName())) {
            throw new Error(`Project with name ${project.getName()} already exists`);
        }
        this.projects.set(project.getName(), project);

        UnsafeFlagsService.flag(UnsafeFlags.PERSISTENCE);
    }
}
