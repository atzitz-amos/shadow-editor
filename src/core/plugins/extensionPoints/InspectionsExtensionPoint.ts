import {PluginManager} from "../PluginManager";
import {ExtensionPoint} from "./ExtensionPoint";
import {EditorPlugin} from "../loader/Plugin";
import {InspectionBase} from "../../lang/inspections/Inspection";
import {GlobalState} from "../../global/GlobalState";

export class InspectionsExtensionPoint implements ExtensionPoint {
    private static readonly instance: InspectionsExtensionPoint = new InspectionsExtensionPoint();

    private readonly inspections: Record<string, InspectionBase[]> = {};

    static get class(): ExtensionPoint {
        return InspectionsExtensionPoint.instance;
    }

    getName(): string {
        return "inspections";
    }

    register(manager: PluginManager, owner: EditorPlugin, instance: any): void {
        if (this.isInspectionBase(instance)) {
            GlobalState.getLangSupport().registerInspection(instance);

            const ownerName = owner.getId();
            if (!this.inspections[ownerName]) {
                this.inspections[ownerName] = [];
            }
            this.inspections[ownerName].push(instance);
        }
    }

    unregister(manager: PluginManager, owner: EditorPlugin): void {
        const inspections = this.inspections[owner.getId()];
        if (inspections) {
            delete this.inspections[owner.getId()];
            for (const inspection of inspections) {
                (GlobalState.getLangSupport() as any).suppressInspection(inspection);
            }
        }
    }

    private isInspectionBase(instance: any): instance is InspectionBase {
        return !!instance
            && typeof instance.getId === "function"
            && typeof instance.getSeverity === "function"
            && typeof instance.getApplicableLanguages === "function";
    }

    static definingPlugin(inspection: InspectionBase) {
        for (const pluginId in InspectionsExtensionPoint.instance.inspections) {
            if (InspectionsExtensionPoint.instance.inspections[pluginId].includes(inspection)) {
                return pluginId;
            }
        }
        return null;
    }
}

