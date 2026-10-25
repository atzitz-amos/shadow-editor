const STATEFUL_SYMBOL = Symbol("SyntaxBuilderOptimizer.Stateful");

/**
 * Marks a parser field whose value influences how a {@link ParserBoundaryNode} is parsed.
 * Its value is part of the checkpoint fingerprint and is restored when a node is reused.
 *
 * Fields are registered per instance from the field initializer rather than through `context.metadata`,
 * so this works regardless of the decorator version the build uses.
 */
export function Stateful<This, Value>(value: undefined, context: ClassFieldDecoratorContext<This, Value>) {
    if (context.kind !== "field") {
        throw new Error("@SyntaxBuilderOptimizer.Stateful can only be used on fields");
    }
    const name = context.name;
    return function (this: This, initialValue: Value): Value {
        ((this as any)[STATEFUL_SYMBOL] ??= []).push(name);
        return initialValue;
    };
}

export function getStatefulFields(instance: any): (string | symbol)[] {
    return instance?.[STATEFUL_SYMBOL] ?? [];
}

/**
 * Captures and restores the {@link Stateful} fields of a parser and of the helper parsers it owns directly
 * (e.g. an expression parser stored in one of its fields).
 */
export class StatefulSnapshot {
    private readonly holders: { instance: any, fields: (string | symbol)[] }[] = [];

    constructor(parser: any) {
        for (const instance of [parser, ...Object.values(parser)]) {
            const fields = getStatefulFields(instance);
            if (fields.length > 0) this.holders.push({instance, fields});
        }
    }

    capture(): unknown[] {
        const values: unknown[] = [];
        for (const {instance, fields} of this.holders) {
            for (const field of fields) values.push(instance[field]);
        }
        return values;
    }

    restore(values: unknown[]) {
        let i = 0;
        for (const {instance, fields} of this.holders) {
            for (const field of fields) instance[field] = values[i++];
        }
    }
}
