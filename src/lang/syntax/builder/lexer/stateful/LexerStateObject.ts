/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class LexerStateObject {
    constructor(public readonly name: string) {
    }

    public createFrame(data: any): LexerStateFrame {
        return new LexerStateFrame(this, data);
    }
}

export class LexerStateFrame {
    constructor(public readonly state: LexerStateObject, public readonly data: any) {
    }

    getData<T>(): T {
        return this.data as T;
    }
}
