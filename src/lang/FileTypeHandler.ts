import {LanguageBase} from "./LanguageBase";
import {ExtensionPointSupplier} from "../core/plugins/extensionPoints/ExtensionPointSupplier";
import {ProjectFile} from "../core/project/filesystem/tree/ProjectFile";

export abstract class FileTypeHandler implements ExtensionPointSupplier {
    public abstract getSupportLevel(file: ProjectFile): SupportLevel;

    public abstract getLanguageForFile(file: ProjectFile): LanguageBase | null;
}

export enum SupportLevel {
    DOESNT = 0,
    BASIC = 1,
    SUPPORTS = 2,
    OVERRIDE = 3
}