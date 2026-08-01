/**
 *
 * @author Atzitz Amos
 * @date 7/30/2026
 * @since 1.0.0
 */
export function ParserBoundaryNode(
    target: Function,
    context: ClassMethodDecoratorContext
) {
    const methodName = String(context.name);

    return function (this: any, ...args: any[]) {
        return target.apply(this, args);
    };
}