interface Renderable {
    /**
     * Render the component. Expensive operation, as it triggers a repaint. Consider using `update` whenever possible
     * @return the rendered element */
    render(): void;

    /**
     * Update the component */
    update(): void;

    /**
     * Destroy the component */
    destroy(): void;
}