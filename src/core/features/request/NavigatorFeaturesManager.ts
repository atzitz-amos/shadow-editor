import {Persisted} from "../../persistence/objects/Persisted";
import {GlobalState} from "../../global/GlobalState";
import {NavigatorFeaturesRequestModal} from "./NavigatorFeaturesRequestModal";

/**
 *
 * @author Atzitz Amos
 * @date 11/16/2026
 * @since 1.0.0
 */
export type NavigatorFeature = {
    name: string;
    description: string;
    notAvailableMessage?(): string | null;
    isAvailable(): Promise<boolean>;
    run(): Promise<boolean>
}

export class NavigatorFeaturesManager {
    @Persisted
    private static accessor dontAskAgain: boolean = false;

    @Persisted
    private static accessor userPreferences: Map<string, boolean> = new Map<string, boolean>();

    private static readonly features: Map<string, NavigatorFeature> = new Map<string, NavigatorFeature>();
    private static readonly availableFeatures: Map<string, boolean> = new Map<string, boolean>();

    public static isFeatureAvailable(feature: string): boolean {
        return this.availableFeatures.get(feature) ?? false;
    }

    public static requestUserGestureEnabledFeature(feature: NavigatorFeature) {
        if (GlobalState.isReady()) {
            throw new Error("Cannot register features after load: " +
                "Please make sure to register features in `Plugin.onLoadAsync`");
        }
        this.features.set(feature.name, feature);
    }

    public static async showPermissionModal(): Promise<void> {
        if (this.dontAskAgain) return;

        const unavailableFeaturesWithFix: Map<string, NavigatorFeature> = new Map();
        const availableFeatures: Map<string, NavigatorFeature> = new Map<string, NavigatorFeature>();
        for (const feature of this.features.values()) {
            if (await feature.isAvailable()) {
                availableFeatures.set(feature.name, feature);
            } else {
                const fix = feature.notAvailableMessage?.();
                if (fix) {
                    unavailableFeaturesWithFix.set(feature.name, feature);
                    availableFeatures.set(feature.name, feature);
                }
            }
        }

        if (availableFeatures.size === 0) {
            return;
        }

        const result = await new NavigatorFeaturesRequestModal(availableFeatures, unavailableFeaturesWithFix, this.userPreferences).show();
        this.dontAskAgain = result.dontAskAgain;
        for (const [featureName, isEnabled] of result.features.entries()) {
            this.userPreferences.set(featureName, isEnabled);
            this.availableFeatures.set(featureName, isEnabled);
        }
    }

    public static clearDontAskAgain(): void {
        this.dontAskAgain = false;
    }
}
