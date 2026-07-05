/**
 *
 * @author Atzitz Amos
 * @date 7/3/2026
 * @since 1.0.0
 */
export interface KeybindEventLike {
    shiftKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
    metaKey: boolean;

    preventDefault(): void;

    stopPropagation(): void;
}


export class PhantomKeybindEvent implements KeybindEventLike {
    shiftKey: boolean = false;
    ctrlKey: boolean = false;
    altKey: boolean = false;
    metaKey: boolean = false;

    preventDefault(): void {
    }

    stopPropagation(): void {
    }
}