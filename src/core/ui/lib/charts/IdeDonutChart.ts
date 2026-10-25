import {UIComponent} from "../../engine/components/UIComponent";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";

export type IdeDonutSegment = {
    label: string,
    value: number,
    color: string
}

export type IdeDonutChartOptions = {
    /** Diameter of the chart, in pixels. Defaults to 150 */
    size?: number,
    /** Width of the ring, in pixels. Defaults to 16 */
    thickness?: number,
    /** Space between two segments, in pixels. Defaults to 2 */
    gap?: number,
    /** Formats the values in the center and in the legend */
    format?: (value: number) => string,
    /** Small text under the total. Defaults to "total" */
    caption?: string,
    /** Shows the label, value and share of each segment next to the chart. Defaults to true */
    legend?: boolean
}

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * A ring split into one segment per value, with the total in its center and an optional legend.
 * <p>
 * Hovering a segment or its legend row focuses it: the other segments fade and the center shows its value.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class IdeDonutChart extends UIComponent {
    /** Elements showing each segment, in the ring and in the legend, by segment index */
    private segmentElements: Element[][] = [];
    /** Part of the turn covered by each segment drawn in the ring, clockwise from the top, between 0 and 1 */
    private arcs: { index: number, start: number, end: number }[] = [];
    private centerValue: SVGTextElement;
    private centerCaption: SVGTextElement;

    constructor(private segments: IdeDonutSegment[], private readonly options: IdeDonutChartOptions = {}) {
        super(HTMLUtils.createDiv("ide-donut"));
    }

    setSegments(segments: IdeDonutSegment[]): void {
        this.segments = segments;
        this.redraw();
    }

    draw(): void {
        const root = this.getUnderlyingElement();
        root.innerHTML = "";
        this.segmentElements = this.segments.map(() => []);
        this.arcs = [];

        const chart = root.appendChild(this.createChart());
        // The ring is hit-tested by hand: browsers hit-test a dashed stroke as if it were solid, so the segment
        // drawn last would catch the pointer anywhere on the ring
        chart.addEventListener("mousemove", e => this.focus(this.segmentAt(chart, e)));
        chart.addEventListener("mouseleave", () => this.focus(null));

        if (this.options.legend ?? true) {
            root.appendChild(this.createLegend());
            this.segmentElements.forEach((elements, index) => elements
                .filter(element => !(element instanceof SVGElement))
                .forEach(element => {
                    element.addEventListener("mouseenter", () => this.focus(index));
                    element.addEventListener("mouseleave", () => this.focus(null));
                }));
        }
    }

    /**
     * @returns the index of the segment under the pointer, null when it is in the hole or outside the ring
     */
    private segmentAt(chart: SVGSVGElement, e: MouseEvent): number | null {
        const size = this.options.size ?? 150;
        const thickness = this.options.thickness ?? 16;
        const bounds = chart.getBoundingClientRect();
        const scale = size / bounds.width;

        const x = (e.clientX - bounds.left) * scale - size / 2;
        const y = (e.clientY - bounds.top) * scale - size / 2;
        const distance = Math.hypot(x, y);
        const radius = size / 2 - thickness / 2;
        if (Math.abs(distance - radius) > thickness / 2 + 2) return null;

        // Clockwise from the top, as the segments are drawn
        const turn = ((Math.atan2(x, -y) / (2 * Math.PI)) + 1) % 1;
        return this.arcs.find(arc => turn >= arc.start && turn < arc.end)?.index ?? null;
    }

    /** Focuses a segment, or shows the total again for null */
    private focus(index: number | null) {
        this.getUnderlyingElement().classList.toggle("focusing", index !== null);
        this.segmentElements.forEach((elements, i) => elements.forEach(element => element.classList.toggle("focused", i === index)));

        const segment = index === null ? null : this.segments[index];
        this.centerValue.textContent = this.format(segment ? segment.value : this.total());
        this.centerCaption.textContent = segment ? segment.label : this.options.caption ?? "total";
    }

    private format(value: number): string {
        return this.options.format ? this.options.format(value) : String(Math.round(value * 100) / 100);
    }

    private total(): number {
        return this.segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0);
    }

    private createChart(): SVGSVGElement {
        const size = this.options.size ?? 150;
        const thickness = this.options.thickness ?? 16;
        const gap = this.options.gap ?? 2;
        const center = size / 2;
        const radius = center - thickness / 2;
        const circumference = 2 * Math.PI * radius;
        const total = this.total();

        const svg = document.createElementNS(SVG_NS, "svg");
        svg.classList.add("ide-donut-chart");
        svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
        svg.setAttribute("width", String(size));
        svg.setAttribute("height", String(size));

        // Segments start at the top and go clockwise
        const ring = document.createElementNS(SVG_NS, "g");
        ring.setAttribute("transform", `rotate(-90 ${center} ${center})`);
        svg.appendChild(ring);

        const circle = (className: string) => {
            const element = document.createElementNS(SVG_NS, "circle");
            element.classList.add(className);
            element.setAttribute("cx", String(center));
            element.setAttribute("cy", String(center));
            element.setAttribute("r", String(radius));
            element.setAttribute("stroke-width", String(thickness));
            ring.appendChild(element);
            return element;
        };

        circle("ide-donut-track");

        let offset = 0;
        this.segments.forEach((segment, index) => {
            if (total <= 0 || segment.value <= 0) return;

            // Each segment is a single dash of the circle; segments too small for the gap keep their full length
            const length = segment.value / total * circumference;
            const visible = length > gap * 2 ? length - gap : length;

            const element = circle("ide-donut-segment");
            element.setAttribute("stroke", segment.color);
            element.setAttribute("stroke-dasharray", `${visible} ${circumference - visible}`);
            element.setAttribute("stroke-dashoffset", String(-offset));
            this.segmentElements[index].push(element);
            this.arcs.push({index, start: offset / circumference, end: (offset + length) / circumference});

            offset += length;
        });

        const text = (className: string, y: number) => {
            const element = document.createElementNS(SVG_NS, "text");
            element.classList.add(className);
            element.setAttribute("x", String(center));
            element.setAttribute("y", String(y));
            element.setAttribute("text-anchor", "middle");
            svg.appendChild(element);
            return element;
        };
        this.centerValue = text("ide-donut-total", center + 1);
        this.centerCaption = text("ide-donut-caption", center + 17);
        this.centerValue.textContent = this.format(total);
        this.centerCaption.textContent = this.options.caption ?? "total";

        return svg;
    }

    private createLegend(): HTMLElement {
        const legend = HTMLUtils.createDiv("ide-donut-legend");
        const total = this.total();

        this.segments.forEach((segment, index) => {
            const name = HTMLUtils.createElement("span.ide-donut-legend-name", legend);
            HTMLUtils.createElement("span.ide-donut-swatch", name).style.background = segment.color;
            name.appendChild(document.createTextNode(segment.label));

            const value = HTMLUtils.createElement("span.ide-donut-legend-value", legend);
            value.textContent = this.format(segment.value);

            const share = HTMLUtils.createElement("span.ide-donut-legend-share", legend);
            share.textContent = total > 0 ? Math.round(segment.value / total * 100) + "%" : "–";

            this.segmentElements[index].push(name, value, share);
        });
        return legend;
    }
}
