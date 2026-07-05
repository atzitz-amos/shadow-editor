import {AbstractStartupPhase} from "../StartupPhase";
import {DefaultActionsRegistry} from "../../../../editor/impl/actions/loader/DefaultActionsRegistry";

/**
 *
 * @author Atzitz Amos
 * @date 7/3/2026
 * @since 1.0.0
 */
export class EditorComponentsInitPhase extends AbstractStartupPhase {
    name: string = "Initializing editor components";
    priority: number = 50;

    async run(): Promise<void> {
        DefaultActionsRegistry.ensureLoaded();
    }
}
