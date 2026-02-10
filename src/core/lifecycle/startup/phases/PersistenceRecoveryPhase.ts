import {AbstractStartupPhase} from "../StartupPhase";
import {PersistenceModel} from "../../../persistence/PersistenceModel";
import {PersistenceStrategy} from "../../../persistence/PersistenceStrategy";
import {PersistedObject} from "../../../persistence/transaction/PersistedObject";

/**
 * Phase that recovers persisted data from the database.
 * Runs after plugins (priority 20) so settings are available before services start.
 *
 * @author Atzitz Amos
 * @date 2/3/2026
 * @since 1.0.0
 */
export class PersistenceRecoveryPhase extends AbstractStartupPhase {
    readonly name = "Recovering Data";
    readonly priority = 20;
    readonly critical = true;

    constructor(private readonly persistedObjects: PersistedObject<any>[]) {
        super();
    }

    async run(): Promise<void> {
        await PersistenceModel.getInstance().recover(
            PersistenceStrategy.PERSIST,
            this.persistedObjects
        );
    }
}

