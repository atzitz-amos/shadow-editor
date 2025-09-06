import {Component} from "../../core/components/Component";
import {Editor} from "../../Editor";
import {View} from "../View";
import {HTMLUtils} from "../../utils/HTMLUtils";
import {Registry} from "../../core/Registry";


export class HScrollBar implements Component {
    name: string = "h-scrollbar";
    id: string = Registry.getComponentIDFor(this);

    private scrollbar: HTMLElement;
    private handle: HTMLElement;

    private isDragging: boolean = false;
    private startX: number = 0;
    private startLeft: number;

    constructor(private view: View) {
    }

    onDestroy(editor: Editor): void {

    }

    onRender() {
        this.scrollbar = HTMLUtils.createElement("div.scrollbar.h-scroll", this.view.layers.layers_el);
        this.handle = HTMLUtils.createElement("div.scrollbar-handle", this.scrollbar);
        this.handle.style.width = "0";

        this.scrollbar.addEventListener("mousedown", (e) => {
            this.clicked(e);
            e.preventDefault();
            e.stopPropagation();
        });

        this.handle.addEventListener("mousedown", (e) => {
            this.isDragging = true;
            this.startX = e.clientX;
            this.startLeft = parseFloat(this.handle.style.left) || 0;
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
        const scroll = this.view.scroll.scrollX;
        const width = this.scrollbar.getBoundingClientRect().width;
        const maxWidth = this.view.getMaxWidth();

        if (maxWidth - width <= 3) { // No need to show scrollbar
            this.handle.style.width = "0";
            return;
        }

        const handleWidth = Math.max((width / maxWidth) * width, 20);
        const handleX = (scroll / maxWidth) * width;


        this.handle.style.width = HTMLUtils.px(handleWidth);
        this.handle.style.left = HTMLUtils.px(handleX);
    }

    private drag(e: MouseEvent) {
        const deltaX = e.clientX - this.startX;
        const scrollbarWidth = this.scrollbar.clientWidth;
        const handleWidth = this.handle.clientWidth;
        const maxHandleLeft = scrollbarWidth - handleWidth;

        let newLeft = Math.min(Math.max(this.startLeft + deltaX, 0), maxHandleLeft);

        this.handle.style.left = `${newLeft}px`;

        // Map handle position → content scrollLeft
        const contentWidth = this.view.getMaxWidth();
        const viewportWidth = this.scrollbar.getBoundingClientRect().width;
        const maxScrollLeft = contentWidth - viewportWidth;

        const scrollRatio = newLeft / maxHandleLeft;
        this.view.scrollBy(scrollRatio * maxScrollLeft - this.view.scroll.scrollX, 0);
    }

    private clicked(e: MouseEvent) {
        const rect = this.scrollbar.getBoundingClientRect();
        const clickY = e.clientY - rect.left;

        const scrollbarWidth = this.scrollbar.clientWidth;
        const handleWidth = this.handle.clientWidth;
        const maxHandleLeft = scrollbarWidth - handleWidth;

        // Center the handle where the user clicked
        let newLeft = Math.min(
            Math.max(clickY - handleWidth / 2, 0),
            maxHandleLeft
        );

        const contentWidth = this.view.getMaxWidth();
        const viewportWidth = this.scrollbar.getBoundingClientRect().width;
        const maxScrollLeft = contentWidth - viewportWidth;

        const scrollRatio = newLeft / maxHandleLeft;
        this.view.scrollBy(scrollRatio * maxScrollLeft - this.view.scroll.scrollX, 0);
    }
}
