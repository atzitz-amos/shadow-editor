import {ProjectFile} from "../workspace/filetree/ProjectFile";
import {LanguageBase} from "./LanguageBase";
import {ExtensionPointSupplier} from "../plugins/extensionPoints/ExtensionPointSupplier";

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