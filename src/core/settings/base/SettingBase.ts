import {SettingCategory} from "../category/SettingCategory";
import {SettingsManager} from "../SettingsManager";
import {SettingCreateEvent} from "../events/SettingCreateEvent";
import {SettingChangedEvent} from "../events/SettingChangedEvent";
import {GlobalState} from "../../global/GlobalState";

/**
 * Represents a setting of type T
 *
 * @author Atzitz Amos
 * @date 11/2/2025
 * @since 1.0.0
 */
export abstract class SettingBase<T> {
    protected currentValue: T;
    private defaultValue: T;

    private description: string;
    private category: SettingCategory;
    private cssPropertyName: string | null = null;
    private unit?: string;

    protected constructor(private key: string) {
        SettingsManager.deferLoad(this);
        GlobalState.getMainEventBus().syncPublish(new SettingCreateEvent(this));
    }

    public validate(value: T): boolean {
        return true;
    }

    public defaultsTo(value: T): SettingBase<T> {
        this.defaultValue = value;
        return this;
    }

    public in(category: SettingCategory): SettingBase<T> {
        this.category = category;
        return this;
    }

    public setDescription(description: string): SettingBase<T> {
        this.description = description;
        return this;
    }

    public asCssProperty(propertyName: string, unit?: string): SettingBase<T> {
        this.cssPropertyName = propertyName;
        this.unit = unit;
        return this;
    }

    public getKey(): string {
        return this.key;
    }

    public getDescription(): string {
        return this.description;
    }

    public getDefaultValue(): T {
        return this.defaultValue;
    }

    public getCurrentValue(): T {
        return this.currentValue;
    }

    public getCategory(): SettingCategory {
        return this.category;
    }

    public getCssPropertyName(): string | null {
        return this.cssPropertyName;
    }

    public getUnit(): string {
        return this.unit || "";
    }

    public setCurrentValue(value: T): boolean {
        if (!this.validate(value)) {
            return false;
        }
        const oldValue = this.currentValue;
        this.currentValue = value;
        GlobalState.getMainEventBus().asyncPublish(new SettingChangedEvent(this, oldValue, value));
        return true;
    }

    public reset(): void {
        this.setCurrentValue(this.defaultValue);
    }
}
