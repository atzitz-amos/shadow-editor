import {KeybindContextDescriptor} from "./context/KeybindContextDescriptor";

export enum Modifier {
    CTRL,
    SHIFT,
    ALT
}

export enum Key {
    NUM0 = "0",
    NUM1 = "1",
    NUM2 = "2",
    NUM3 = "3",
    NUM4 = "4",
    NUM5 = "5",
    NUM6 = "6",
    NUM7 = "7",
    NUM8 = "8",
    NUM9 = "9",
    A = "a",
    B = "b",
    C = "c",
    D = "d",
    E = "e",
    F = "f",
    G = "g",
    H = "h",
    I = "i",
    J = "j",
    K = "k",
    L = "l",
    M = "m",
    N = "n",
    O = "o",
    P = "p",
    Q = "q",
    R = "r",
    S = "s",
    T = "t",
    U = "u",
    V = "v",
    W = "w",
    X = "x",
    Y = "y",
    Z = "z",
    ESCAPE = "Escape",
    BACKSPACE = "Backspace",
    DELETE = "Delete",
    ENTER = "Enter",
    TAB = "Tab",
    ARROW_UP = "ArrowUp",
    ARROW_DOWN = "ArrowDown",
    ARROW_LEFT = "ArrowLeft",
    ARROW_RIGHT = "ArrowRight",
    PAGE_UP = "PageUp",
    PAGE_DOWN = "PageDown",
    HOME = "Home",
    END = "End",
    SPACE = " ",
    COMMA = ",",
    PERIOD = ".",
    SEMICOLON = ";",
    QUOTE = "'",
    SLASH = "/",
    BACKSLASH = "\\",
    DASH = "-",
    EQUALS = "=",
    LEFT_BRACKET = "[",
    RIGHT_BRACKET = "]",
    QUESTION_MARK = "?",
    TILDE = "~",
    CAPS_LOCK = "CapsLock",
    INSERT = "Insert",
    LeftClick = "LClick",
    LeftDoubleClick = "LDoubleClick",
    LeftTripleClick = "LTripleClick",
    MiddleClick = "MiddleClick",
    RightClick = "RClick",
    RightDoubleClick = "RDoubleClick",
}

export type Keybind = {
    key: Key;
    ctrl?: boolean | null;
    shift?: boolean | null;
    alt?: boolean | null;
    context?: KeybindContextDescriptor;
};

export class Shortcut {
    public static ctrl(key: Key, context?: KeybindContextDescriptor): Keybind {
        return {key, ctrl: true, context};
    }

    public static ctrlAlt(key: Key, context?: KeybindContextDescriptor): Keybind {
        return {key, ctrl: true, alt: true, context};
    }

    public static ctrlShift(key: Key, context?: KeybindContextDescriptor): Keybind {
        return {key, ctrl: true, shift: true, context};
    }

    public static altShift(key: Key, context?: KeybindContextDescriptor): Keybind {
        return {key, alt: true, shift: true, context};
    }

    public static ctrlShiftAlt(key: Key, context?: KeybindContextDescriptor): Keybind {
        return {key, ctrl: true, shift: true, alt: true, context};
    }

    public static shift(key: Key, context?: KeybindContextDescriptor): Keybind {
        return {key, shift: true, context};
    }

    public static alt(key: Key, context?: KeybindContextDescriptor): Keybind {
        return {key, alt: true, context};
    }
}

export class ModifierKeyHolder {
    static INSTANCE: ModifierKeyHolder;
    isCtrlPressed: boolean = false;
    isAltPressed: boolean = false;
    isShiftPressed: boolean = false;
    isMouseDown: boolean = false;
    isDragging: boolean = false;

    static isCtrlPressed(): boolean {
        return this.getInstance().isCtrlPressed;
    };

    static isAltPressed(): boolean {
        return this.getInstance().isAltPressed;
    }

    static isShiftPressed(): boolean {
        return this.getInstance().isShiftPressed;
    };

    static isMouseDown(): boolean {
        return this.getInstance().isMouseDown;
    }

    static isDragging(): boolean {
        return this.getInstance().isDragging;
    }

    static getInstance(): ModifierKeyHolder {
        if (!this.INSTANCE) {
            this.INSTANCE = new ModifierKeyHolder();
        }
        return this.INSTANCE;
    }

    set(event: { shiftKey?: boolean, ctrlKey?: boolean, altKey?: boolean, button?: number }): void {
        this.isCtrlPressed = event.ctrlKey ?? false;
        this.isAltPressed = event.altKey ?? false;
        this.isShiftPressed = event.shiftKey ?? false;
        this.isMouseDown = event.button !== undefined && event.button === 0;
    }

    setIsDragging(isDragging: boolean): void {
        this.isDragging = isDragging;
    }

    clear(): void {
        this.isCtrlPressed = false;
        this.isAltPressed = false;
        this.isShiftPressed = false;
        this.isMouseDown = false;
    }
}