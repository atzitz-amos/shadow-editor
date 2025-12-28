import {SettingBase} from "./base/SettingBase";

/**
 *
 * @author Atzitz Amos
 * @date 11/2/2025
 * @since 1.0.0
 */
export class SettingsManager {
    private static _INSTANCE = new SettingsManager();

    private readonly mySettings: Map<string, SettingBase<any>> = new Map();

    private isLoaded: boolean = false;

    public static getInstance(): SettingsManager {
        return this._INSTANCE;
    }

    /**
     * Defer loading of setting, and register it at the same time.
     * This setting will be initialized with the saved value or default value later.
     *
     * @param setting The setting to defer load
     * */
    public static deferLoad(setting: SettingBase<any>): void {
        this.getInstance().deferredLoad(setting);
    }

    public static getValue<T>(setting: SettingBase<T>): T {
        if (!this.getInstance().isLoaded) {
            console.warn("Settings have not been loaded yet. Accessing settings before they are loaded may lead to unexpected behavior.");
        }
        return setting.getCurrentValue();
    }

    public forKey<T>(key: string): SettingBase<T> | null {
        return this.mySettings.get(key) as SettingBase<T> || null;
    }

    /**
     * Defer loading of setting, and register it at the same time.
     * This setting will be initialized with the saved value or default value later.
     *
     * @param setting The setting to defer load
     * */
    public deferredLoad(setting: SettingBase<any>): void {
        if (this.isLoaded) {
            console.warn("Settings have already been loaded. Deferred loading a setting now may lead to unexpected behavior.");
        }
        this.mySettings.set(setting.getKey(), setting);
    }

    public getAllCSSLinkedSettings() {
        return this.mySettings.entries().flatMap(
            ([_, setting]) => {
                return setting.getCssPropertyName() !== null ? [setting] : [];
            }
        );
    }

    public loadAll() {
        // TODO: Persist settings loading logic
        for (const setting of this.mySettings.values()) {
            // For now, just set to default value
            setting.reset();
        }
        this.isLoaded = true;

    }

    getAllSettings(): SettingBase<any>[] {
        return Array.from(this.mySettings.values());
    }
}
