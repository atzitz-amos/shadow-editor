export interface Closeable {
    close(): void;
}

export enum CloseOn {
    ESCAPE = 1,
    BLUR = 2,
    KEY_TYPED = 4,
    KEY_PRESS = 8,
    MOUSE_CLICK = 16,
    DEFAULT = CloseOn.ESCAPE | CloseOn.KEY_TYPED | CloseOn.KEY_PRESS | CloseOn.MOUSE_CLICK,
}