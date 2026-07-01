import {Service} from "../threaded/service/Service";
import {Workspace} from "./Workspace";
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
export class WorkspaceService implements PersistedObject {
    private static readonly instance: WorkspaceService = new WorkspaceService();

    @UIMutators.mutates(UICommonMutators.WORKSPACE_LIST)
    private readonly workspaces: Map<string, Workspace> = new Map<string, Workspace>();

    public static getInstance(): WorkspaceService {
        return WorkspaceService.instance;
    }

    public begin() {
    }

    getPersistedKey(): string {
        return "shadow.workspace.list";
    }

    persist(serializer: Serializer): Serialized {
        return serializer.serializeArray(this.workspaces.values().toArray());
    }

    load(deserializer: Deserializer, data: Serialized): void {
        if (!data) return;
        deserializer.use(Workspace, Workspace.deserializer)

        const workspaces: Workspace[] = deserializer.deserializeList(data);
        for (const workspace of workspaces) {
            this.workspaces.set(workspace.getName(), workspace);
        }
    }

    getAllWorkspaces(): Workspace[] {
        return Array.from(this.workspaces.values());
    }

    persistWorkspace(workspace: Workspace): void {
        if (this.workspaces.has(workspace.getName())) {
            throw new Error(`Workspace with name ${workspace.getName()} already exists`);
        }
        this.workspaces.set(workspace.getName(), workspace);

        UnsafeFlagsService.flag(UnsafeFlags.PERSISTENCE);
    }
}
