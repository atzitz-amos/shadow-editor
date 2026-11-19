import {NavigatorFeature} from "./NavigatorFeaturesManager";
import {HTMLUtils} from "../../utils/HTMLUtils";
import {LaunchComponent} from "../../../app/ui/launch/LaunchComponent";

/**
 *
 * @author Atzitz Amos
 * @date 11/16/2026
 * @since 1.0.0
 */
export class NavigatorFeaturesRequestModal {

    constructor(private readonly features: Map<string, NavigatorFeature>, private readonly unavailableWithError: Map<string, NavigatorFeature>, private readonly userPreferences: Map<string, boolean>) {

    }

    show(): Promise<NavigatorPermissionModalResult> {
        const splash = LaunchComponent.getCurrentInstance()?.getSplashElement();
        if (!splash) {
            throw new Error("Cannot show navigator features request modal: LaunchComponent is not initialized");
        }

        const root = HTMLUtils.createDiv("shadow-splash-permission-modal", splash);
        const description = HTMLUtils.createDiv("shadow-splash-permission-modal-description", root);
        description.innerText = "The application requires the following permissions to function properly:";
        const featuresList = HTMLUtils.createDiv("shadow-splash-permission-modal-features-list", root);
        for (const feature of this.features.values()) {
            const featureItem = HTMLUtils.createElement("ide-checkbox.shadow-splash-permission-modal-item", featuresList);
            const featureLabel = HTMLUtils.createDiv("shadow-splash-permission-modal-item-label", featureItem);
            featureLabel.innerHTML = feature.description;

            if (this.unavailableWithError.has(feature.name)) {
                featureItem.setAttribute("disabled", "");
                const errorMessage = HTMLUtils.createDiv("shadow-splash-permission-modal-item-error", featuresList);
                errorMessage.innerHTML = this.unavailableWithError.get(feature.name)?.notAvailableMessage?.() ?? "This feature is not available in your browser.";
            } else if (!this.userPreferences.has(feature.name) || this.userPreferences.get(feature.name))
                featureItem.setAttribute("checked", "");

        }

        const buttonsContainer = HTMLUtils.createDiv("shadow-splash-permission-modal-buttons", root);
        const confirmButton = HTMLUtils.createElement("ide-button.shadow-splash-permission-modal-confirm", buttonsContainer);
        confirmButton.setAttribute("primary", "");
        confirmButton.innerHTML = "Confirm";
        const dontAskAgainCheckbox = HTMLUtils.createElement("ide-checkbox.shadow-splash-permission-modal-dont-ask-again", buttonsContainer);
        dontAskAgainCheckbox.innerText = "Don't ask again";

        return new Promise(resolve => {
            confirmButton.addEventListener("click", async () => {
                const result: NavigatorPermissionModalResult = {
                    dontAskAgain: dontAskAgainCheckbox.hasAttribute("checked"),
                    features: new Map<string, boolean>()
                };
                for (const feature of this.features.values()) {
                    const featureItem = featuresList.querySelector(`ide-checkbox.shadow-splash-permission-modal-item:nth-child(${Array.from(this.features.keys()).indexOf(feature.name) + 1})`);
                    if (featureItem) {
                        const isEnabled = featureItem.hasAttribute("checked");
                        if (isEnabled) {
                            result.features.set(feature.name, await feature.run());
                        } else {
                            result.features.set(feature.name, false);
                        }
                    }
                }
                root.remove();

                resolve(result);
            });
        });
    }
}

export type NavigatorPermissionModalResult = {
    dontAskAgain: boolean;
    features: Map<string, boolean>;
}
