import {ExtensionPoint} from "../../../core/plugins/extensionPoints/ExtensionPoint";
import {InspectionBase} from "./Inspection";
import {LanguageBase} from "../../LanguageBase";
import {EditorPlugin} from "../../../core/plugins/loader/Plugin";

/**
 *
 * @author Atzitz Amos
 * @date 8/4/2026
 * @since 1.0.0
 */
export class InspectionsRegistry {
    public static readonly inspectionEP: ExtensionPoint<InspectionBase> = new ExtensionPoint("inspections", InspectionBase);

    public static getAll(): InspectionBase[] {
        return InspectionsRegistry.inspectionEP.getAll();
    }

    public static getAllForLanguage(language: LanguageBase) {
        return InspectionsRegistry.getAll().filter(x => x.getApplicableLanguages().includes(language));
    }

    public static getForPlugin(pluginId: string) {
        return InspectionsRegistry.getAll().filter(x => InspectionsRegistry.definingPlugin(x)?.getId() === pluginId);
    }

    public static getInspectionById(id: string) {
        return InspectionsRegistry.getAll().find(x => x.getId() === id);
    }

    public static definingPlugin(inspection: InspectionBase): EditorPlugin | undefined {
        return InspectionsRegistry.inspectionEP.definingPlugin(inspection);
    }
}
