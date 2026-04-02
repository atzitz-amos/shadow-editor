import {LanguageBase} from "./LanguageBase";
import {ExtensionPointSupplier} from "../plugins/extensionPoints/ExtensionPointSupplier";
import {WorkspaceFile} from "../workspace/filesystem/tree/WorkspaceFile";

export abstract class FileTypeHandler implements ExtensionPointSupplier {
    public abstract getSupportLevel(file: WorkspaceFile): SupportLevel;

    public abstract getLanguageForFile(file: WorkspaceFile): LanguageBase | null;
}

export enum SupportLevel {
    DOESNT = 0,
    BASIC = 1,
    SUPPORTS = 2,
    OVERRIDE = 3
}