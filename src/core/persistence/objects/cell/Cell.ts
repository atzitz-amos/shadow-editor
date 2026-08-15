import {PersistedOptions} from "./PersistedOptions";

/**
 *
 * @author Atzitz Amos
 * @date 8/13/2026
 * @since 1.0.0
 */
export interface Cell {
    init(value: any): void;

    getKey(): string;

    getValue(): any;

    getOptions(): PersistedOptions | undefined;

    getVersion(): number;
}
