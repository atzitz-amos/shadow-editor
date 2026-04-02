import {AbstractStartupPhase} from "../StartupPhase";
import {ServiceImpl} from "../../../threaded/service/Service";

/**
 * Phase that calls begin() on all registered services.
 * Runs after persistence recovery (priority 30) so services can access persisted data.
 *
 * @author Atzitz Amos
 * @date 2/3/2026
 * @since 1.0.0
 */
export class ServiceBeginPhase extends AbstractStartupPhase {
    readonly name = "Starting Services";
    readonly priority = 30;
    readonly critical = true;

    constructor(private readonly services: ServiceImpl[]) {
        super();
    }

    async run(): Promise<void> {
        for (const service of this.services) {
            const result = service.begin() as void | Promise<void>;
            // Support both sync and async begin()
            if (result && typeof (result as Promise<void>).then === 'function') {
                await result;
            }
        }
    }
}

