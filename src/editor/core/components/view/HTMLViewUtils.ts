import {HTMLInlineSpanView} from "./HTMLInlineSpanView";
import {Editor} from "../../../Editor";

export class HTMLViewUtils {
    /**
     * Create a new stylesheet map containing only common style properties across all `elements`*/
    public static createCommonStylesheet(elements: HTMLElement[]): Map<string, any> {
        let result = new Map<string, any>();
        if (elements.length === 0) {
            return result;
        }
        const firstStyles = elements[0].style;
        for (let i = 0; i < firstStyles.length; i++) {
            const prop = firstStyles.item(i);
            if (prop) {
                const value = firstStyles.getPropertyValue(prop);
                let allMatch = true;
                for (let j = 1; j < elements.length; j++) {
                    const otherValue = elements[j].style.getPropertyValue(prop);
                    if (otherValue !== value) {
                        allMatch = false;
                        break;
                    }
                }
                if (allMatch) {
                    result.set(prop, value);
                }
            }
        }
        return result;
    }

    public static createStyleProxy(elements: HTMLElement[]): CSSStyleDeclaration {
        const myStyles = HTMLViewUtils.createCommonStylesheet(elements);

        return new Proxy<CSSStyleDeclaration>({
            setProperty(property: string, value: string | null, priority?: string) {
                myStyles.set(property, value);
                for (const el of elements) {
                    el.style.setProperty(property, value ?? "", priority);
                }
            },
            getPropertyValue(property: string): string {
                if (myStyles.has(property)) {
                    return myStyles.get(property) ?? "";
                } else {
                    for (const el of elements) {
                        const value = el.style.getPropertyValue(property);
                        if (value) {
                            return value;
                        }
                    }
                    return "";
                }
            }
        } as CSSStyleDeclaration, {
            get(target: CSSStyleDeclaration, p: string | symbol, receiver: any): any {
                if (typeof p === "string") {
                    return target.getPropertyValue(p);
                }
                return Reflect.get(target, p, receiver);
            },

            set(target: CSSStyleDeclaration, p: string | symbol, newValue: any, receiver: any): boolean {
                if (typeof p === "string") {
                    target.setProperty(p, newValue);
                    return true;
                }
                return Reflect.set(target, p, newValue, receiver);
            }
        });
    }

    static createView(editor: Editor, elements: HTMLElement[]): HTMLInlineSpanView {
        if (elements[0].tagName === 'SPAN') {
            return new HTMLInlineSpanView(editor, elements);
        }
        throw new Error("Unsupported element type: " + elements[0].tagName);
    }
}