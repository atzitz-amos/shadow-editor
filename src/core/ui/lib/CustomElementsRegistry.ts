/**
 *
 * @author Atzitz Amos
 * @date 6/16/2026
 * @since 1.0.0
 */
export class CustomElementsRegistry {
     public static register(name: string, constructor: CustomElementConstructor) {
        if (!window.customElements.get(name)) {
            window.customElements.define(name, constructor);
        }
    }
}
