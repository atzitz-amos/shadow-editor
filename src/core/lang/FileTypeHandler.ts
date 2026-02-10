import {ProjectFile} from "../project/filetree/ProjectFile";
import {LanguageBase} from "./LanguageBase";
import {ExtensionPointSupplier} from "../plugins/extensionPoints/ExtensionPointSupplier";

export abstract class FileTypeHandler implements ExtensionPointSupplier {
    public abstract getSupportLevel(file: ProjectFile): SupportLevel;

    public abstract getLanguageForFile(file: ProjectFile): LanguageBase | null;
}

export enum SupportLevel {
    DOESNT = 0,
    BASIC_FUNCTIONALITIES = 1,
    SUPPORTS = 2,
    SHOULD_OVERRIDE = 3
}