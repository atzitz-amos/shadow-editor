export class HTMLUtils {
    static createElement(s: string, x?: HTMLElement): HTMLElement {
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
        return el as HTMLElement;
    }

    static px(value: number | string): string {
        return `${value}px`;
    }

    static isInBound(element: HTMLElement, x: number, y: number, delta = 5) {
        let bbox = element.getBoundingClientRect();
        return bbox.left - delta <= x && bbox.right + delta >= x && bbox.top - delta <= y && bbox.bottom + delta >= y;
    }
}