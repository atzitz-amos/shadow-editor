export class HTMLUtils {
    static createElement<T extends HTMLElement>(s: string, x?: HTMLElement): T {
        function _(e, t, v) {
            switch (t) {
                case '.':
                    e.classList.add(v);
                    break;
                case '#':
                    e.id = v;
                    break;
            }
        }

        let name = ""
        let el: HTMLElement | null = null;
        let type: string | null = null;
        for (let i of s) {
            if ([".", "#"].includes(i)) {
                if (!el) {
                    el = document.createElement(name);
                } else {
                    _(el, type, name);
                }
                type = i;
                name = "";
            } else name += i;
        }
        _(el, type, name);

        if (x) {
            x.appendChild(el as HTMLElement);
        }
        return el as T;
    }

    static px(value: number | string): string {
        return `${value}px`;
    }

    static isInBound(element: HTMLElement, x: number, y: number, delta = 5) {
        let bbox = element.getBoundingClientRect();
        return bbox.left - delta <= x && bbox.right + delta >= x && bbox.top - delta <= y && bbox.bottom + delta >= y;
    }

    static createDiv(className?: string, parent?: HTMLElement): HTMLDivElement {
        const div = document.createElement('div');
        if (className) {
            div.className = className;
        }
        if (parent) {
            parent.appendChild(div);
        }
        return div;
    }

    static measure(element: HTMLElement, parent: HTMLElement = document.body): DOMRect {
        const clone = element.cloneNode(true) as HTMLElement;
        clone.style.position = 'absolute';
        clone.style.visibility = 'hidden';
        parent.appendChild(clone);
        const rect = clone.getBoundingClientRect();
        parent.removeChild(clone);
        return rect;
    }

    static attachAt(
        component: HTMLElement,
        x: number,
        y: number,
        width: number,
        height: number,
        anchor: HTMLAnchor
    ): void {
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        // Helper to calculate top/left relative to viewport (x, y)
        const calculatePosition = (currentAnchor: HTMLAnchor) => {
            let left = x;
            let top = y;

            // Horizontal alignment
            if (currentAnchor.includes('W') || currentAnchor === 'W') {
                left = x - width;
            } else if (currentAnchor.includes('E') || currentAnchor === 'E') {
                left = x;
            } else {
                // N, S, or CENTER
                left = x - width / 2;
            }

            // Vertical alignment
            if (currentAnchor.includes('N') || currentAnchor === 'N') {
                top = y - height;
            } else if (currentAnchor.includes('S') || currentAnchor === 'S') {
                top = y;
            } else {
                // E, W, or CENTER
                top = y - height / 2;
            }

            return {left, top};
        };

        let activeAnchor = anchor;
        let {left, top} = calculatePosition(activeAnchor);

        // Viewport overflow checks
        const overflowsTop = top < 0;
        const overflowsBottom = top + height > viewportHeight;
        const overflowsLeft = left < 0;
        const overflowsRight = left + width > viewportWidth;

        // Vertical Flip
        if (overflowsTop && activeAnchor.includes('N')) {
            activeAnchor = activeAnchor.replace('N', 'S') as HTMLAnchor;
        } else if (overflowsBottom && activeAnchor.includes('S')) {
            activeAnchor = activeAnchor.replace('S', 'N') as HTMLAnchor;
        }

        // Horizontal Flip
        if (overflowsLeft && activeAnchor.includes('W')) {
            activeAnchor = activeAnchor.replace('W', 'E') as HTMLAnchor;
        } else if (overflowsRight && activeAnchor.includes('E')) {
            activeAnchor = activeAnchor.replace('E', 'W') as HTMLAnchor;
        }

        // Recalculate position after potential flip
        ({left, top} = calculatePosition(activeAnchor));

        // Clamp inside viewport as a fallback if flipped side also overflows
        left = Math.max(0, Math.min(left, viewportWidth - width));
        top = Math.max(0, Math.min(top, viewportHeight - height));

        // Apply fixed positioning to break free from parent offsets
        component.style.position = 'fixed';
        component.style.width = `${width}px`;
        component.style.left = `${left}px`;
        component.style.top = `${top}px`;
    }
}