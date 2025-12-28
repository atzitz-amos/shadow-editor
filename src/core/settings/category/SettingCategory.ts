import {SettingBase} from "../base/SettingBase";
import {SettingCategories} from "./SettingCategories";

/**
 *
 * @author Atzitz Amos
 * @date 11/2/2025
 * @since 1.0.0
 */
export class SettingCategory {
    private readonly associatedSettings: SettingBase<any>[] = [];

    private readonly children: SettingCategories[] = [];

    constructor(private name: string, private description: string, private parent: SettingCategory | null = null) {
        if (parent) {
            parent.addChildCategory(this);
        }
    }

    public createSubCategory(name: string, description: string): SettingCategory {
        return new SettingCategory(name, description, this);
    }

    public getName(): string {
        return this.name;
    }

    public getDescription(): string {
        return this.description;
    }

    public getParent(): SettingCategories | null {
        return this.parent;
    }

    public getAssociatedSettings(): SettingBase<any>[] {
        return this.associatedSettings;
    }

    public getChildren(): SettingCategories[] {
        return this.children;
    }

    private addChildCategory(category: SettingCategories): void {
        this.children.push(category);
    }
}
