import {AbstractStartupPhase} from "../StartupPhase";

/**
 *
 * @author Atzitz Amos
 * @date 8/14/2026
 * @since 1.0.0
 */
export class WorkspaceRestorePhase extends AbstractStartupPhase {
    name: string = "Restoring workspace";
    priority: number = 60;

    async run(): Promise<void> {

    }
}
