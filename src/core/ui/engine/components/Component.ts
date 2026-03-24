/**
 *
 * @author Atzitz Amos
 * @date 2/28/2026
 * @since 1.0.0
 */
export interface Component {
    draw(): void;

    getParent(): Component | null;

    getUnderlyingElement(): HTMLElement;

    getChildren(): Component[];

    addChild(child: Component): void;
}
