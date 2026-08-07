import {IncrementalParserOptimizer} from "../impl/IncrementalParserOptimizer";
import {getAllStatefulFields} from "./Stateful";

export const IncrementalParser =
    function <T extends Constructor>(
        target: T,
        context: ClassDecoratorContext
    ): T {
        const optimizer = new IncrementalParserOptimizer(target, getAllStatefulFields(context));

        return class extends target {
            constructor(...args: any[]) {
                super(...args);
                this._optimizer = optimizer.begin(this, args);
            }
        };
    };