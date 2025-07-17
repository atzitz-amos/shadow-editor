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
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
    F = "F",
    G = "G",
    H = "H",
    I = "I",
    J = "J",
    K = "K",
    L = "L",
    M = "M",
    N = "N",
    O = "O",
    P = "P",
    Q = "Q",
    R = "R",
    S = "S",
    T = "T",
    U = "U",
    V = "V",
    W = "W",
    X = "X",
    Y = "Y",
    Z = "Z",
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
}

export class Keybinding {
    public key: Key;
    public modifiers: Modifier[];

    private constructor(key: Key, modifiers: Modifier[] = []) {
        this.key = key;
        this.modifiers = modifiers;
    }

    public static of(...keys: (Modifier | Key)[]): Keybinding {
        let key: Key;
        const modifiersList: Modifier[] = [];
        for (const item of keys) {
            if (item instanceof Modifier) {
                modifiersList.push(item);
            } else {
                key = item;
            }
        }
        return new Keybinding(key, modifiersList);
    }

    public matches(event: KeyboardEvent): boolean {
        const keyMatch = event.key.toUpperCase() === this.key;
        const modifierMatch = this.modifiers.every(modifier => {
            switch (modifier) {
                case Modifier.CTRL:
                    return event.ctrlKey;
                case Modifier.SHIFT:
                    return event.shiftKey;
                case Modifier.ALT:
                    return event.altKey;
                default:
                    return false;
            }
        });
        return keyMatch && modifierMatch;
    }
}