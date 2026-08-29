import {ReferenceResolver} from "./resolve/ReferenceResolver";

/**
 *
 * @author Atzitz Amos
 * @date 8/28/2026
 * @since 1.0.0
 */
export interface IndexFile extends ReferenceResolver {
    getParents(): IndexFile[];

    makeAvailable(file: IndexFile): void;
}
