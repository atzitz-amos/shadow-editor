import {Component} from "../../core/components/Component";
import {Editor} from "../../Editor";
import {View} from "../View";
import {HTMLUtils} from "../../utils/HTMLUtils";
import {Registry} from "../../core/Registry";


export class VScrollBar implements Component {
    name: string = "v-scrollbar";
    id: string = Registry.getComponentIDFor(this);

    private scrollbar: HTMLElement;
    private handle: HTMLElement;

    private isDragging: boolean = false;
    private startY: number = 0;
    private startTop: number;

    constructor(private view: View) {
    }

    onDestroy(editor: Editor): void {

    }

    onRender() {
        this.scrollbar = HTMLUtils.createElement("div.scrollbar.v-scroll", this.view.layers.layers_el);
        this.handle = HTMLUtils.createElement("div.scrollbar-handle", this.scrollbar);
        this.handle.style.height = "0";

        this.scrollbar.addEventListener("mousedown", (e) => {
            this.clicked(e);
            e.preventDefault();
            e.stopPropagation();
        });

        this.handle.addEventListener("mousedown", (e) => {
            this.isDragging = true;
            this.startY = e.clientY;
            this.startTop = parseFloat(this.handle.style.top) || 0;
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener("mousemove", (e) => {
            if (this.isDragging) {
                this.drag(e);
            }
        });

        document.addEventListener("mouseup", (e) => {
            this.isDragging = false;
        });
    }

    update() {
        const scroll = this.view.scroll.scrollY;
        const height = this.scrollbar.getBoundingClientRect().height;
        const maxHeight = this.view.getMaxHeight();

        if (maxHeight - height <= 3) { // No need to show scrollbar
            this.handle.style.height = "0";
            return;
        }

        const handleHeight = Math.max((height / maxHeight) * height, 20);
        const handleY = (scroll / maxHeight) * height;


        this.handle.style.height = HTMLUtils.px(handleHeight);
        this.handle.style.top = HTMLUtils.px(handleY);
    }

    private drag(e: MouseEvent) {
        const deltaY = e.clientY - this.startY;
        const scrollbarHeight = this.scrollbar.clientHeight;
        const handleHeight = this.handle.clientHeight;
        const maxHandleTop = scrollbarHeight - handleHeight;

        let newTop = Math.min(Math.max(this.startTop + deltaY, 0), maxHandleTop);

        this.handle.style.top = `${newTop}px`;

        // Map handle position → content scrollTop
        const contentHeight = this.view.getMaxHeight();
        const viewportHeight = this.scrollbar.getBoundingClientRect().height;
        const maxScrollTop = contentHeight - viewportHeight;

        const scrollRatio = newTop / maxHandleTop;
        this.view.scrollBy(0, scrollRatio * maxScrollTop - this.view.scroll.scrollY);
    }

    private clicked(e: MouseEvent) {
        const rect = this.scrollbar.getBoundingClientRect();
        const clickY = e.clientY - rect.top;

        const scrollbarHeight = this.scrollbar.clientHeight;
        const handleHeight = this.handle.clientHeight;
        const maxHandleTop = scrollbarHeight - handleHeight;

        // Center the handle where the user clicked
        let newTop = Math.min(
            Math.max(clickY - handleHeight / 2, 0),
            maxHandleTop
        );

        const contentHeight = this.view.getMaxHeight();
        const viewportHeight = this.scrollbar.getBoundingClientRect().height;
        const maxScrollTop = contentHeight - viewportHeight;

        const scrollRatio = newTop / maxHandleTop;
        this.view.scrollBy(0, scrollRatio * maxScrollTop - this.view.scroll.scrollY);
    }
}
