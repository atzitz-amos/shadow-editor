import {ProjectFile} from "../core/project/File";

export abstract class FileTypeHandler {
    public abstract getSupportLevel(file: ProjectFile): SupportLevel;

    public abstract getLanguageForFile(file: ProjectFile): string | null;
}

export enum SupportLevel {
    DOESNT = 0,
    BASIC_FUNCTIONALITIES = 1,
    SUPPORTS = 2,
    SHOULD_OVERRIDE = 3
}