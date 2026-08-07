import {Component} from "../../core/components/Component";
import {Editor} from "../../Editor";
import {View} from "../view/View";
import {HTMLUtils} from "../../utils/HTMLUtils";
import {ScrollMode} from "./Scrolling";


export class HScrollBar implements Component {
    name: string = "h-scrollbar";

    private scrollbar: HTMLElement;
    private handle: HTMLElement;

    private isDragging: boolean = false;
    private startX: number = 0;
    private startLeft: number;

    constructor(private view: View) {
    }

    onDestroy(editor: Editor): void {
        document.removeEventListener("mousemove", this.onDocMouseMove);
        document.removeEventListener("mouseup", this.onDocMouseUp);
    }

    onRender() {
        this.scrollbar = HTMLUtils.createElement("div.scrollbar.h-scroll", this.view.getLayers().layers_el);
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

        document.addEventListener("mousemove", this.onDocMouseMove);
        document.addEventListener("mouseup", this.onDocMouseUp);
    }

    update() {
        const scrollX = this.view.scrolling.scrollX;
        const trackWidth = this.scrollbar.clientWidth;
        const contentWidth = this.view.getMaxWidth();
        const maxScrollX = contentWidth - trackWidth;

        if (maxScrollX <= 3) { // No need to show scrollbar
            this.handle.style.width = "0";
            this.scrollbar.style.pointerEvents = "none";
            return;
        }
        this.scrollbar.style.pointerEvents = "auto";

        const handleWidth = Math.max((trackWidth / contentWidth) * trackWidth, 20);
        const maxHandleLeft = trackWidth - handleWidth;
        const handleX = maxScrollX > 0 ? (scrollX / maxScrollX) * maxHandleLeft : 0;

        this.handle.style.width = HTMLUtils.px(handleWidth);
        this.handle.style.left = HTMLUtils.px(handleX);
    }

    private readonly onDocMouseMove = (e: MouseEvent) => {
        if (this.isDragging) this.drag(e);
    };

    private readonly onDocMouseUp = () => {
        this.isDragging = false;
    };

    private drag(e: MouseEvent) {
        const deltaX = e.clientX - this.startX;
        const trackWidth = this.scrollbar.clientWidth;
        const handleWidth = this.handle.clientWidth;
        const maxHandleLeft = trackWidth - handleWidth;

        const newLeft = Math.min(Math.max(this.startLeft + deltaX, 0), maxHandleLeft);
        this.handle.style.left = HTMLUtils.px(newLeft);

        this.setScrollFromHandleLeft(newLeft, maxHandleLeft, trackWidth);
    }

    private clicked(e: MouseEvent) {
        const rect = this.scrollbar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;

        const trackWidth = this.scrollbar.clientWidth;
        const handleWidth = this.handle.clientWidth;
        const maxHandleLeft = trackWidth - handleWidth;

        // Center the handle where the user clicked
        const newLeft = Math.min(Math.max(clickX - handleWidth / 2, 0), maxHandleLeft);

        this.setScrollFromHandleLeft(newLeft, maxHandleLeft, trackWidth);
    }

    private setScrollFromHandleLeft(newLeft: number, maxHandleLeft: number, trackWidth: number) {
        const contentWidth = this.view.getMaxWidth();
        const maxScrollX = contentWidth - trackWidth;

        const scrollRatio = maxHandleLeft > 0 ? newLeft / maxHandleLeft : 0;
        const targetScrollX = scrollRatio * maxScrollX;

        // Absolute positioning — never route scrollbar drag/click through scrollBy,
        // which normalizes/clamps deltas for wheel input specifically.
        this.view.scrolling.scrollTo(targetScrollX, this.view.scrolling.scrollY, ScrollMode.Instant);
    }
}