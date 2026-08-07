import {UIComponentMixin} from "../../engine/components/UIComponent";
import {Focusable} from "../../engine/mixins/Focusable";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {WorkspaceDirectory} from "../../../workspace/filesystem/tree/WorkspaceDirectory";
import {FSNodeEntry} from "../../../workspace/filesystem/tree/FSNodeEntry";

type FileSystemTreeOptions = {
    comparer?: (a: FSNodeEntry, b: FSNodeEntry) => void
}

const defaultCompare = (a: FSNodeEntry, b: FSNodeEntry): number => {
    if (a.isDirectory() && b.isFile() || a.isFile() && b.isDirectory()) return a.isDirectory() ? -1 : 1;
    return a.getName().localeCompare(b.getName(), undefined, {numeric: true, sensitivity: 'base'});
};


/**
 *
 * @author Atzitz Amos
 * @date 8/7/2026
 * @since 1.0.0
 */
export class FileSystemTree extends UIComponentMixin(Focusable) {
    private readonly compare: (a: FSNodeEntry, b: FSNodeEntry) => void;

    private nodes = new Map<string, FSNodeEntry>();
    private parents = new Map<string, string | null>();
    private rows = new Map<string, HTMLElement>();
    private lis = new Map<string, HTMLLIElement>();
    private childLists = new Map<string, HTMLUListElement>();
    private expanded = new Set<string>();


    constructor(parentEl: HTMLElement, private readonly rootDirectory: WorkspaceDirectory, private readonly options: FileSystemTreeOptions = {}) {
        super(HTMLUtils.createDiv("file-system-tree", parentEl));

        this.compare = options.comparer ?? defaultCompare;
    }

    draw() {

    }
}
