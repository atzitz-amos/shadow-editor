import {ShadowUI} from "./ui/ShadowUI";
import {PersistenceModel} from "../core/persistence/PersistenceModel";
import {PersistenceStrategy} from "../core/persistence/PersistenceStrategy";
import {GlobalState} from "../core/global/GlobalState";
import {ShadowAppLoadedEvent} from "./events/ShadowAppLoadedEvent";

/**
 * Represents an opened editor. It manages the panes, tabs, and documents within the editor.
 *
 * *Warning: This class will take up the whole UI space. If you want to integrate an editor into an existing UI,
 * consider using the {@link Editor} class instead.*
 *
 * @author Atzitz Amos
 * @date 11/2/2025
 * @since 1.0.0
 */
export class ShadowApp {
    constructor() {
        ShadowUI.launch(this);
    }

    public static launch(): void {
        new ShadowApp().init();
    }

    public init(): void {
        PersistenceModel.recover(PersistenceStrategy.PERSIST);
        GlobalState.load();

        this.delayedStart();
    }

    private delayedStart(): void {
        setTimeout(() => {
            GlobalState.setReady(true);

            GlobalState.getMainEventBus().syncPublish(new ShadowAppLoadedEvent(this));
        }, 0);
    }
}