import {ProjectFile} from "../core/project/filetree/ProjectFile";

export type ViewProperties = {
    width?: int;
    height?: int;
    gutterWidth?: int;
};

export type EditorProperties = {
    file?: ProjectFile;
    view?: ViewProperties;
};

export const defaults = {
    view: {
        width: 600,
        height: 400,
        gutterWidth: 60,
    }
}