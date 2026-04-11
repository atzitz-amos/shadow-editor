import {Document} from "../../../../editor/core/document/Document";

/**
 *
 * @author Atzitz Amos
 * @date 4/10/2026
 * @since 1.0.0
 */
export interface ITab {
    getId(): string;

    getTitle(): string;

    getPosition(): number;

    setPosition(position: number): void;

    isActive(): boolean;

    setActive(active: boolean): void;

    getDocument(): Document;
}
