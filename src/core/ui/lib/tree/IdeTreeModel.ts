import {Icon} from "../../icons/Icon";
import {UIComponent} from "../../engine/components/UIComponent";
import {ContextMenu} from "../menu/impl/ContextMenu";
import {DataKey} from "../../../keybinds/context/data/DataKey";

/**
 * Data behind an {@link IdeTree}. Children are only requested when a group is expanded for the first time,
 * and may be loaded asynchronously.
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export interface IdeTreeModel<T> {
    /** Stable identifier of the node, used to keep expansion and selection across updates */
    getId(node: T): string;

    getRoots(): T[] | Promise<T[]>;

    /** Whether the node can contain children, i.e. can be expanded */
    isGroup(node: T): boolean;

    getChildren(node: T): T[] | Promise<T[]>;

    getLabel(node: T): string;
}

/**
 * An icon instance, the css classes of an {@code <i>} element (e.g. "fa-solid fa-flask"), or null for no icon.
 */
export type IdeTreeIcon = Icon | string | null;

export type IdeTreeOptions<T> = {
    /** Additional css classes of the tree element */
    className?: string,
    /** Order of siblings, the model order is kept when omitted */
    compare?: (a: T, b: T) => number,

    // ---- rendering ----

    /** Defaults to a folder for groups and a file for leaves */
    getIcon?: (node: T, expanded: boolean) => IdeTreeIcon,
    /** Fills the label element, defaults to the text of {@link IdeTreeModel.getLabel()} */
    renderLabel?: (node: T, label: HTMLElement) => void,
    /** Fills the trailing area of the row: counters, status, badges... */
    decorate?: (node: T, decorations: HTMLElement) => void,
    /**
     * Buttons shown on the row when it is hovered or selected, in place of the decorations.
     * Components are drawn and disposed by the tree.
     */
    rowActions?: (node: T) => (UIComponent | HTMLElement)[],
    /** Css classes added to the item of the node */
    getClassName?: (node: T) => string | null,
    /** Text shown when there are no roots */
    emptyText?: string,
    /** Defaults to true */
    indentGuides?: boolean,
    /** Indentation of a level, in pixels. Defaults to 18, which lines a child chevron up under its parent icon */
    indent?: number,
    /** Height of a row, in pixels. Defaults to 24 */
    rowHeight?: number,

    // ---- behavior ----

    /** Whether a group starts expanded when it first appears */
    isInitiallyExpanded?: (node: T, depth: number) => boolean,
    /** Opened by a right click on a row, after selecting it */
    contextMenu?: ContextMenu | null,
    /** Data the rows expose to actions and context menus, see {@link ContextResolver} */
    provideData?: (node: T, key: DataKey<unknown>) => unknown,

    // ---- drag and drop ----

    /** Whether the row of the node can be dragged; nothing is draggable by default */
    canDrag?: (node: T) => boolean,
    /** Whether the dragged node may be dropped on the target, null standing for the empty area of the tree */
    canDrop?: (dragged: T, target: T | null) => boolean,
    /** Called when a dragged node is dropped where {@link canDrop} allowed it */
    onDrop?: (dragged: T, target: T | null) => void,

    // ---- events ----

    onSelect?: (node: T | null) => void,
    /** Double click or Enter on a leaf */
    onOpen?: (node: T) => void,
    onToggle?: (node: T, expanded: boolean) => void,
    /** Called before the built-in key handling, which is skipped if the event is default-prevented */
    onKeydown?: (event: KeyboardEvent, node: T) => void
}
