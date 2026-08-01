const STATEFUL_SYMBOL = Symbol("SyntaxBuilderOptimizer.Stateful");

export function Stateful(value: undefined, context: ClassFieldDecoratorContext) {
    if (context.kind !== "field") {
        throw new Error("@SyntaxBuilderOptimizer.Stateful can only be used on fields");
    }
    const metadata = context.metadata;
    const fields: string[] = (metadata[STATEFUL_SYMBOL] as string[]) ?? [];
    fields.push(String(context.name));
    metadata[STATEFUL_SYMBOL] = fields;
}

export function getAllStatefulFields(context: ClassDecoratorContext) {
    return (context.metadata[STATEFUL_SYMBOL] as string[]) ?? [];
}