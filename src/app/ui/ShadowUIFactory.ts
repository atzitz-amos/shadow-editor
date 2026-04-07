import {LaunchComponent} from "./launch/LaunchComponent";
import {GlobalState} from "../../core/global/GlobalState";
import {ShadowAppLoadedEvent} from "../events/ShadowAppLoadedEvent";
import {ShadowUI} from "./ShadowUI";
import {FullShadowUI} from "./full/FullShadowUI";
import {HTMLUtils} from "../../editor/utils/HTMLUtils";
import {ShadowUILoadedEvent} from "../events/ShadowUILoadedEvent";

/**
 * A factory to create most UI components of the app. It may schedule the creation of components if the app is not fully loaded yet.
 *
 * @author Atzitz Amos
 * @date 11/6/2025
 * @since 1.0.0
 */
export class ShadowUIFactory {
    public static singleEditorUI(): Promise<ShadowUI> {
        return new Promise((resolve, reject) => {
            GlobalState.getMainEventBus().subscribe(
                this, ShadowAppLoadedEvent.SUBSCRIBER, () => {
                    resolve(this.createSingleEditorUI());
                }
            );
        });
    }

    public static fullAppUI(): Promise<ShadowUI> {
        if (GlobalState.isReady()) {
            return Promise.resolve(this.createFullAppUI());
        }
        return new Promise((resolve, reject) => {
            GlobalState.getMainEventBus().subscribe(
                this, ShadowAppLoadedEvent.SUBSCRIBER, () => {
                    resolve(this.createFullAppUI());
                }
            );
        });
    }

    public static showLaunchComponent() {
        LaunchComponent.showSplashScreen(this);
    }

    /**
     * Actual factory to create a single editor UI*/
    private static createSingleEditorUI(): ShadowUI {
        return <any>null; // TODO
    }

    /**
     * Actual factory to create a full app UI */
    private static createFullAppUI(): ShadowUI {
        const ui = new FullShadowUI(HTMLUtils.createElement("div.app", document.body));
        ui.draw();
        ui.addEventListeners();

        GlobalState.getMainEventBus().asyncPublish(new ShadowUILoadedEvent(ui));

        return ui;
    }
}
