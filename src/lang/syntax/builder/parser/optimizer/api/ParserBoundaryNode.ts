import {IncrementalParserOptimizer} from "../impl/IncrementalParserOptimizer";

/**
 *
 * @author Atzitz Amos
 * @date 7/30/2026
 * @since 1.0.0
 */
export function ParserBoundaryNode(
    target: (...args: any[]) => void,
    context: ClassMethodDecoratorContext
) {

    return function (this: any, ...args: any[]) {
        const optimizer = this._optimizer as IncrementalParserOptimizer;
        if (optimizer === undefined) {
            console.warn(`ParserBoundaryNode decorator used on method ${target.name} of class ${context.name.toString()}, but no optimizer found. Make sure the class is decorated with @IncrementalParser.`);
            return target.apply(this, args);
        }

        optimizer.invoke(target, this, args);
    };
}