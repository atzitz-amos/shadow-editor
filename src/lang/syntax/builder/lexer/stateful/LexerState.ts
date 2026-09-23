import {LexerStateFrame, LexerStateObject} from "./LexerStateObject";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class LexerState {
    private readonly states: LexerStateFrame[] = [];

    static create(name: string) {
        return new LexerStateObject(name);
    }

    enter(state: LexerStateObject, data?: any): void {
        this.states.push(state.createFrame(data));
    }

    exit() {
        return this.states.pop();
    }

    getCurrentState(): LexerStateFrame | null {
        return this.states.length > 0 ? this.states[this.states.length - 1] : null;
    }

    is(stateObject: LexerStateObject) {
        return this.states.some(frame => frame.state === stateObject);
    }

    isToplevel(stateObject: LexerStateObject) {
        return this.states.length > 0 && this.states[0].state === stateObject;
    }
}
