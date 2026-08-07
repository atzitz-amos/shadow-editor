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
    F1 = "F1",
    F2 = "F2",
    F3 = "F3",
    F4 = "F4",
    F5 = "F5",
    F6 = "F6",
    F7 = "F7",
    F8 = "F8",
    F9 = "F9",
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

    // Numpad Keys
    NUMPAD0 = "Numpad0",
    NUMPAD1 = "Numpad1",
    NUMPAD2 = "Numpad2",
    NUMPAD3 = "Numpad3",
    NUMPAD4 = "Numpad4",
    NUMPAD5 = "Numpad5",
    NUMPAD6 = "Numpad6",
    NUMPAD7 = "Numpad7",
    NUMPAD8 = "Numpad8",
    NUMPAD9 = "Numpad9",
    NUMPAD_ENTER = "NumpadEnter",
    NUMPAD_ADD = "NumpadAdd",
    NUMPAD_SUBTRACT = "NumpadSubtract",
    NUMPAD_MULTIPLY = "NumpadMultiply",
    NUMPAD_DIVIDE = "NumpadDivide",
    NUMPAD_DECIMAL = "NumpadDecimal",

    // Mouse Clicks
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
    priority?: number;
};

export class Shortcut {
    public static ctrl(key: Key): Keybind {
        return {key, ctrl: true};
    }

    public static ctrlAlt(key: Key): Keybind {
        return {key, ctrl: true, alt: true};
    }

    public static ctrlShift(key: Key): Keybind {
        return {key, ctrl: true, shift: true};
    }

    public static altShift(key: Key): Keybind {
        return {key, alt: true, shift: true};
    }

    public static ctrlShiftAlt(key: Key): Keybind {
        return {key, ctrl: true, shift: true, alt: true};
    }

    public static shift(key: Key): Keybind {
        return {key, shift: true};
    }

    public static alt(key: Key): Keybind {
        return {key, alt: true};
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

    clearCtrl(): void {
        this.isCtrlPressed = false;
    }

    clearShift() {
        this.isShiftPressed = false;
    }

    clearAlt() {
        this.isAltPressed = false;
    }

    clearMouseDown(): void {
        this.isMouseDown = false;
    }
}

