import {ResolveScope} from "./ResolveScope";
import {ResolvedReference} from "./result/ResolvedReference";

/**
 *
 * @author Atzitz Amos
 * @date 8/28/2026
 * @since 1.0.0
 */
export interface ReferenceResolver {
    resolve(name: string, scope: ResolveScope): ResolvedReference[];

    acceptChildrenResolveRequest(scope: ResolveScope): boolean;
}
