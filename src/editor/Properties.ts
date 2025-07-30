import {ProjectFile} from "./project/File";

export type ViewProperties = {
    width?: int;
    height?: int;
    gutterWidth?: int;

    lineHeight?: int;
    caretHeight?: int;
    fontSize?: int;

    rootBgColor?: string;
    rootBorderColor?: string;
    gutterColor?: string;
    caretColor?: string;
    selectionColor?: string;
    activeLineColor?: string;
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
        lineHeight: 25,
        caretHeight: 20,
        fontSize: 16,
        rootBgColor: '#1e1f24',
        rootBorderColor: '#93969f',
        gutterColor: '#93969f',
        caretColor: '#ffffff',
        selectionColor: '#214283',
        activeLineColor: '#2b2e38',
    }
}
