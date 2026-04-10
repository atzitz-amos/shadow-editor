import {UIComponent} from "./components/UIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 3/3/2026
 * @since 1.0.0
 */
export class UiEngine {
    private static readonly observers = new WeakMap<HTMLElement, MutationObserver>();

    public static observe(root: HTMLElement): void {
        const existingObserver = this.observers.get(root);
        if (existingObserver) {
            existingObserver.disconnect();
        }

        const observer = new MutationObserver((records: MutationRecord[]) => {
            const removedComponents = new Set<UIComponent>();

            for (const record of records) {
                for (const removedNode of Array.from(record.removedNodes)) {
                    this.collectRemovedComponents(removedNode, removedComponents);
                }
            }

            const rootsToDispose = Array.from(removedComponents).filter(component => {
                let parent = component.getParent();
                while (parent !== null) {
                    if (removedComponents.has(parent)) {
                        return false;
                    }
                    parent = parent.getParent();
                }
                return true;
            });

            for (const component of rootsToDispose) {
                component.dispose();
            }
        });

        observer.observe(root, {
            childList: true,
            subtree: true
        });

        this.observers.set(root, observer);
    }

    private static collectRemovedComponents(node: Node, removedComponents: Set<UIComponent>): void {
        // Nodes moved elsewhere in the document should not be disposed.
        if (node.isConnected) {
            return;
        }

        if (node instanceof HTMLElement) {
            const component = UIComponent.fromElement(node);
            if (component && !component.isDisposed()) {
                removedComponents.add(component);
            }
        }

        for (const child of Array.from(node.childNodes)) {
            this.collectRemovedComponents(child, removedComponents);
        }

    }
}
