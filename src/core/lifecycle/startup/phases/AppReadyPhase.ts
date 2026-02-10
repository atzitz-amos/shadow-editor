import {AbstractStartupPhase} from "../StartupPhase";
import {GlobalState} from "../../../global/GlobalState";
import {ShadowAppLoadedEvent} from "../../../../app/events/ShadowAppLoadedEvent";
import {ShadowApp} from "../../../../app/ShadowApp";

/**
 * Final phase that marks the application as ready.
 * Runs last (priority 100) and fires ShadowAppLoadedEvent.
 *
 * @author Atzitz Amos
 * @date 2/3/2026
 * @since 1.0.0
 */
export class AppReadyPhase extends AbstractStartupPhase {
    readonly name = "Finalizing";
    readonly priority = 100;
    readonly critical = false; // Non-critical since we're almost done

    constructor(private readonly app: ShadowApp) {
        super();
    }

    async run(): Promise<void> {
        GlobalState.setReady(true);
        GlobalState.getMainEventBus().syncPublish(new ShadowAppLoadedEvent(this.app));
    }
}

