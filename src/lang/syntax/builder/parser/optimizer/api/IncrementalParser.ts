import {IncrementalParserOptimizer} from "../impl/IncrementalParserOptimizer";


export const IncrementalParser =
    function <T extends Constructor>(
        target: T,
        context: ClassDecoratorContext
    ): T {
        return class extends target {
            constructor(...args: any[]) {
                super(...args);
                // One optimizer per parser instance: it holds the cursor into the saved checkpoints.
                this._optimizer = new IncrementalParserOptimizer().begin(this, args);
            }
        };
    };
