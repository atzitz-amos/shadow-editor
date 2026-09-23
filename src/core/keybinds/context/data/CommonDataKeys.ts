import {Editor} from "../../../../editor/Editor";
import {IPane} from "../../../../app/core/panes/pane/IPane";
import {ProjectFile} from "../../../project/filesystem/tree/ProjectFile";
import {FileSystemEntry} from "../../../project/filesystem/tree/FileSystemEntry";
import {DataKey} from "./DataKey";
import {FileSystemTree} from "../../../ui/lib/filesystem/FileSystemTree";
import {ITab} from "../../../../app/core/tabs/ITab";

/**
 * Data keys shared by the built-in keybind contexts.
 */
const editor = DataKey.create<Editor>("core:editor");
const pane = DataKey.create<IPane>("core:pane");
const projectFile = DataKey.create<ProjectFile>("core:project-file");
const projectEntry = DataKey.create<FileSystemEntry>("core:project-entry");
const projectFiles = DataKey.create<ReadonlyArray<ProjectFile>>("core:project-files");
const filesTree = DataKey.create<FileSystemTree>("core:files-tree");
const textArea = DataKey.create<boolean>("core:text-area");
const openedEditorTab = DataKey.create<ITab>("core:opened-editor-tab");
const selectedEditorTab = DataKey.create<ITab>("core:selected-editor-tab");

export const CommonDataKeys = {
    EDITOR: editor,
    PANE: pane,
    PROJECT_FILE: projectFile,
    PROJECT_ENTRY: projectEntry,
    PROJECT_FILES: projectFiles,
    TEXT_AREA: textArea,
    FILES_TREE: filesTree,
    OPENED_EDITOR_TAB: openedEditorTab,
    SELECTED_EDITOR_TAB: selectedEditorTab
} as const;
