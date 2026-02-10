import {Service} from "../lifecycle/Service";
import {SettingBase} from "./base/SettingBase";
import {PersistedObject} from "../persistence/transaction/PersistedObject";
import {PersistedData} from "../persistence/transaction/PersistedData";
import {Updater} from "../persistence/transaction/Updater";

/**
 *
 * @author Atzitz Amos
 * @date 11/2/2025
 * @since 1.0.0
 */
@Service
export class SettingsManager implements PersistedObject<any> {
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
            console.warn("[SettingsManager.ts] Settings have not been loaded yet. Accessing settings before they are loaded may lead to unexpected behavior.");
        }
        return setting.getCurrentValue();
    }

    getPersistedKey(): string {
        return "shadow.settings";
    }

    getPersistedModel() {
        return null;
    }

    persist(updater: Updater): void {
        for (const setting of this.mySettings.values()) {
            updater.set(setting.getKey(), setting.getCurrentValue());
        }
    }

    load(data: PersistedData<any>): void {
        for (const setting of this.mySettings.values()) {
            if (data.has(setting.getKey())) {
                setting.setCurrentValue(data.get(setting.getKey()));
            } else
                setting.reset();
        }
        this.isLoaded = true;
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
            console.warn("[SettingsManager.ts] Settings have already been loaded. Deferred loading a setting now may lead to unexpected behavior.");
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

    getAllSettings(): SettingBase<any>[] {
        return Array.from(this.mySettings.values());
    }

    begin() {

    }
}
