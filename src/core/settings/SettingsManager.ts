import {Service} from "../threaded/service/Service";
import {Logger, UseLogger} from "../logging/Logger";
import {SettingBase} from "./base/SettingBase";
import {PersistedObject} from "../persistence/objects/PersistedObject";
import {SerializableType, Serialized} from "../persistence/serializable/Serializable";
import {Serializer} from "../persistence/serializable/Serializer";
import {Deserializer} from "../persistence/serializable/Deserializer";

/**
 *
 * @author Atzitz Amos
 * @date 11/2/2025
 * @since 1.0.0
 */
@Service
@UseLogger("SettingsManager")
export class SettingsManager implements PersistedObject {
    private static _INSTANCE = new SettingsManager();
    private readonly mySettings: Map<string, SettingBase<any>> = new Map();
    private isLoaded: boolean = false;
    private declare readonly logger: Logger;

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

    public static getValue<T extends SerializableType>(setting: SettingBase<T>): T {
        const instance = this.getInstance();
        if (!instance.isLoaded) {
            instance.logger.warn("[SettingsManager.ts] Settings have not been loaded yet. Accessing settings before they are loaded may lead to unexpected behavior.");
        }
        return setting.getCurrentValue();
    }

    getPersistedKey(): string {
        return "shadow.settings";
    }

    load(deserializer: Deserializer, data: Serialized): void {
        if (!data) return;

        deserializer.use(SettingBase, e => e);

        const settings: { key: string, currentValue: any }[] = deserializer.deserializeList(data);
        for (const setting of this.mySettings.values()) {
            const savedSetting = settings.find(s => s.key === setting.getKey());
            if (savedSetting) {
                setting.setCurrentValue(savedSetting.currentValue);
            } else {
                setting.reset();
            }
        }
        this.isLoaded = true;
    }

    persist(serializer: Serializer): Serialized {
        return serializer.serializeArray(this.getAllSettings());
    }


    public forKey<T extends SerializableType>(key: string): SettingBase<T> | null {
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
            this.logger.warn("[SettingsManager.ts] Settings have already been loaded. Deferred loading a setting now may lead to unexpected behavior.");
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
