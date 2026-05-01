import {Service} from "../threaded/service/Service";
import {PersistedData} from "../persistence/transaction/PersistedData";
import {PersistedObject} from "../persistence/transaction/PersistedObject";
import {Updater} from "../persistence/transaction/Updater";
import {Workspace} from "./Workspace";
import {UICommonMutators} from "../../app/core/UICommonMutators";
import {UIMutators} from "../ui/engine/listeners/mutators/UIMutators";

export type WorkspacePersistedData = {
    name: string;
};

/**
 *
 * @author Atzitz Amos
 * @date 4/16/2026
 * @since 1.0.0
 */
@Service
export class WorkspaceService implements PersistedObject<WorkspacePersistedData> {
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

    getPersistedModel(): WorkspacePersistedData {
        return {
            name: ""
        };
    }

    persist(updater: Updater): void {
        for (let workspace of this.workspaces.values()) {
            updater.set(workspace.getName(), {
                name: workspace.getName()
            });
        }
    }

    load(data: PersistedData<WorkspacePersistedData>): void {
        for (let value of data.values()) {
            this.workspaces.set(value.name, new Workspace(value.name));
        }
    }

    getAllWorkspaces(): Workspace[] {
        return Array.from(this.workspaces.values());
    }

    addWorkspace(name: string): void {
        if (this.workspaces.has(name)) {
            throw new Error(`Workspace with name ${name} already exists`);
        }
        this.workspaces.set(name, new Workspace(name));
    }
}
