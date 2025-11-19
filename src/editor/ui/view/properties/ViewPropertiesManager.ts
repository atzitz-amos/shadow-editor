import {ViewProperties} from "../../../Properties";
import {SettingsManager} from "../../../../core/settings/SettingsManager";
import {VisualSettings} from "../../../setting/VisualSettings";
import {View} from "../View";
import {EditorAttachedEvent} from "../../../events/EditorAttachedEvent";
import {SettingChangedEvent} from "../../../../core/settings/events/SettingChangedEvent";
import {ViewVisualPropertiesChangedEvent} from "./ViewVisualPropertiesChangedEvent";
import {HTMLUtils} from "../../../utils/HTMLUtils";
import {ShadowAppLoadedEvent} from "../../../../app/events/ShadowAppLoadedEvent";
import {SettingCreateEvent} from "../../../../core/settings/events/SettingCreateEvent";
import {SettingBase} from "../../../../core/settings/base/SettingBase";

/**
 * Represents the properties of a view in the editor UI and
 * manages the CSS properties associated with them.
 *
 * @author Atzitz Amos
 * @date 11/2/2025
 * @since 1.0.0
 */
export class ViewPropertiesManager {
    private static readonly defaults = {
        width: 600,
        height: 400,
        gutterWidth: 60,
    }

    private width: number;
    private height: number;
    private lineHeight: number;
    private fontSize: number;

    private computeCharSize: () => number;

    private visualLineCount: number;
    private visualCharCount: number;

    private gutterWidth: number;

    private root: HTMLElement;

    constructor(private view: View, initial: ViewProperties = {}) {
        this.width = initial.width ?? ViewPropertiesManager.defaults.width;
        this.height = initial.height ?? ViewPropertiesManager.defaults.height;
        this.gutterWidth = initial.gutterWidth ?? ViewPropertiesManager.defaults.gutterWidth;

        view.getEditor().getEventBus()
            .subscribe(this, EditorAttachedEvent.SUBSCRIBER, ev => this.load(ev))
            .subscribe(this, ShadowAppLoadedEvent.SUBSCRIBER, ev => this.recomputeCounts())
            .subscribe(this, SettingChangedEvent.SUBSCRIBER, ev => this.updateSettingEvent)
            .subscribe(this, SettingCreateEvent.SUBSCRIBER, ev => this.updateSettingEvent);
    }

    public getWidth(): number {
        return this.width;
    }

    public setWidth(width: number) {
        this.width = width;
        this.syncCSS();
    }

    public getHeight(): number {
        return this.height;
    }

    public setHeight(height: number) {
        this.height = height;
        this.syncCSS();
    }

    public getGutterWidth(): number {
        return this.gutterWidth;
    }

    public setGutterWidth(gutterWidth: number) {
        this.gutterWidth = gutterWidth;
        this.syncCSS();
    }

    public getCharSize() {
        if (!this.computeCharSize) {
            this.computeCharSize = _sizer(this.root);
        }
        return this.computeCharSize();
    }

    public getFontSize(): number {
        return this.fontSize;
    }

    public getLineHeight(): number {
        return this.lineHeight;
    }

    public getVisualLineCount(): number {
        return this.visualLineCount;
    }

    getVisualCharCount(): number {
        return this.visualCharCount;
    }

    private load(ev: EditorAttachedEvent) {
        this.root = ev.getEditor().root;

        this.lineHeight = SettingsManager.getValue(VisualSettings.LINE_HEIGHT);
        this.fontSize = SettingsManager.getValue(VisualSettings.FONT_SIZE);

        this.syncCSS();
        SettingsManager.getInstance().getAllSettings().forEach(setting => this.updateSetting(setting, setting.getCurrentValue()));
    }

    private syncCSS() {
        this.root.style.setProperty('--editor-width', this.width + 'px');
        this.root.style.setProperty('--editor-height', this.height + 'px');
        this.root.style.setProperty('--editor-gutter-width', this.gutterWidth + 'px');

        this.view.getEditor().getEventBus().syncPublish(new ViewVisualPropertiesChangedEvent(this.view));
    }

    private updateSettingEvent(ev: SettingChangedEvent) {
        this.updateSetting(ev.getSetting(), ev.getNewValue());
    }

    private updateSetting(setting: SettingBase<any>, newValue: any) {
        if (setting.getCssPropertyName() !== null) {
            this.root.style.setProperty(setting.getCssPropertyName()!, newValue.toString() + setting.getUnit());
        }

        if (setting === VisualSettings.LINE_HEIGHT) {
            this.lineHeight = newValue as number;
            this.recomputeCounts();
        } else if (setting === VisualSettings.FONT_SIZE) {
            this.fontSize = newValue as number;
            this.recomputeCounts();
        }
    }

    private recomputeCounts() {
        this.visualLineCount = Math.floor(this.height / this.lineHeight);
        this.visualCharCount = Math.floor(this.view.getLayers().layers_el.getBoundingClientRect().width / this.charSize);
    }
}


function _sizer(root: HTMLElement) {
    let sizer = HTMLUtils.createElement("div.editor-sizer", root);
    sizer.innerHTML = "a";

    return () => sizer.getBoundingClientRect().width;
}
