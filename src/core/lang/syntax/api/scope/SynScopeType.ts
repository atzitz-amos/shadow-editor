/**
 * Represents a language-specific scope type in the parser.
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export class SynScopeType {
    static Global: SynScopeType = new SynScopeType("G");
    static Function: SynScopeType = new SynScopeType("F")
    static Class: SynScopeType = new SynScopeType("C")
    static Block: SynScopeType = new SynScopeType("B")

    constructor(private name: string) {
    }

    getDebugName(): string {
        return this.name;
    }
}
