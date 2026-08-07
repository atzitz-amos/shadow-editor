import {Component} from "../../core/components/Component";
import {Editor} from "../../Editor";
import {View} from "../view/View";
import {HTMLUtils} from "../../utils/HTMLUtils";
import {ScrollMode} from "./Scrolling";


export class VScrollBar implements Component {
    name: string = "v-scrollbar";

    private scrollbar: HTMLElement;
    private handle: HTMLElement;

    private isDragging: boolean = false;
    private startY: number = 0;
    private startTop: number;

    private readonly onDocMouseMove = (e: MouseEvent) => {
        if (this.isDragging) this.drag(e);
    };
    private readonly onDocMouseUp = () => {
        this.isDragging = false;
    };

    constructor(private view: View) {
    }

    onDestroy(editor: Editor): void {
        document.removeEventListener("mousemove", this.onDocMouseMove);
        document.removeEventListener("mouseup", this.onDocMouseUp);
    }

    onRender() {
        this.scrollbar = HTMLUtils.createElement("div.scrollbar.v-scroll", this.view.getLayers().layers_el);
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

        document.addEventListener("mousemove", this.onDocMouseMove);
        document.addEventListener("mouseup", this.onDocMouseUp);
    }

    update() {
        const scrollY = this.view.scrolling.scrollY;
        const trackHeight = this.scrollbar.clientHeight;
        const contentHeight = this.view.getMaxHeight();
        const maxScrollY = contentHeight - trackHeight;

        if (maxScrollY <= 3) { // No need to show scrollbar
            this.handle.style.height = "0";
            this.scrollbar.style.pointerEvents = "none";
            return;
        }
        this.scrollbar.style.pointerEvents = "auto";

        const handleHeight = Math.max((trackHeight / contentHeight) * trackHeight, 20);
        const maxHandleTop = trackHeight - handleHeight;
        const handleY = maxScrollY > 0 ? (scrollY / maxScrollY) * maxHandleTop : 0;

        this.handle.style.height = HTMLUtils.px(handleHeight);
        this.handle.style.top = HTMLUtils.px(handleY);
    }

    private drag(e: MouseEvent) {
        const deltaY = e.clientY - this.startY;
        const trackHeight = this.scrollbar.clientHeight;
        const handleHeight = this.handle.clientHeight;
        const maxHandleTop = trackHeight - handleHeight;

        const newTop = Math.min(Math.max(this.startTop + deltaY, 0), maxHandleTop);
        this.handle.style.top = HTMLUtils.px(newTop);

        this.setScrollFromHandleTop(newTop, maxHandleTop, trackHeight);
    }

    private clicked(e: MouseEvent) {
        const rect = this.scrollbar.getBoundingClientRect();
        const clickY = e.clientY - rect.top;

        const trackHeight = this.scrollbar.clientHeight;
        const handleHeight = this.handle.clientHeight;
        const maxHandleTop = trackHeight - handleHeight;

        // Center the handle where the user clicked
        const newTop = Math.min(Math.max(clickY - handleHeight / 2, 0), maxHandleTop);

        this.setScrollFromHandleTop(newTop, maxHandleTop, trackHeight);
    }

    private setScrollFromHandleTop(newTop: number, maxHandleTop: number, trackHeight: number) {
        const contentHeight = this.view.getMaxHeight();
        const maxScrollY = contentHeight - trackHeight;

        const scrollRatio = maxHandleTop > 0 ? newTop / maxHandleTop : 0;
        const targetScrollY = scrollRatio * maxScrollY;

        // Absolute positioning — never route scrollbar drag/click through scrollBy,
        // which normalizes/clamps deltas for wheel input specifically.
        this.view.scrolling.scrollTo(this.view.scrolling.scrollX, targetScrollY, ScrollMode.Instant);
    }
}