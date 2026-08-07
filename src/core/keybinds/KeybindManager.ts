import {Key, Keybind} from "./Keybind";
import {AbstractAction} from "../actions/AbstractAction";
import {KeybindContext} from "./context/KeybindContext";
import {KeybindNotApplicableAbortError} from "./context/KeybindNotApplicableAbortError";

/**
 * A single (action, keybind) pairing resolved from either the action's
 * default binding or a user override, ready to be matched against events.
 */
interface ResolvedBinding {
    action: AbstractAction;
    keybind: Keybind;
    source: "user" | "default";
}

/**
 * KeyboardEvent.key is case-sensitive and shift-sensitive for letters
 * ("a" vs "A"), but the Key enum only defines lowercase letters and
 * expects `shift` to be expressed via the Keybind's modifier flags
 * instead. Digits, punctuation, and named keys (Escape, ArrowUp, ...)
 * are left untouched since the enum already matches their raw event.key
 * values exactly, including cases where shift produces a distinct
 * character (e.g. "/" vs "?") - those are intentionally different Key
 * values, not modifier variants.
 */
function normalizeEventKey(rawKey: string): string {
    if (rawKey.length === 1 && /[a-zA-Z]/.test(rawKey)) {
        return rawKey.toLowerCase();
    }
    return rawKey;
}

function keyFromKeyboardEvent(e: KeyboardEvent): Key | undefined {
    if (e.code && e.code.startsWith("Numpad")) {
        const isNumLockDependent = /^Numpad(\d|Decimal)$/.test(e.code);

        if (!isNumLockDependent || e.getModifierState("NumLock")) {
            if ((Object.values(Key) as string[]).includes(e.code)) {
                return e.code as Key;
            }
        }
    }

    const normalized = normalizeEventKey(e.key);
    return (Object.values(Key) as string[]).includes(normalized)
        ? (normalized as Key)
        : undefined;
}

/**
 * Maps a mousedown event to a Key based on button + click count.
 * Note: browsers reset e.detail after a short inactivity window, so
 * double/triple click detection here relies on native browser timing
 * rather than anything this class tracks itself.
 */
function keyFromMouseEvent(e: MouseEvent): Key | undefined {
    switch (e.button) {
        case 0: // left
            if (e.detail >= 3) return Key.LeftTripleClick;
            if (e.detail === 2) return Key.LeftDoubleClick;
            return Key.LeftClick;
        case 1: // middle
            return Key.MiddleClick;
        case 2: // right
            if (e.detail >= 2) return Key.RightDoubleClick;
            return Key.RightClick;
        default:
            return undefined;
    }
}

/** null/undefined modifier = wildcard, matches either state. */
function matchesModifier(want: boolean | null | undefined, actual: boolean): boolean {
    return want === null || want === undefined || want === actual;
}

function modifiersMatch(kb: Keybind, e: KeyboardEvent | MouseEvent): boolean {
    return (
        matchesModifier(kb.ctrl, e.ctrlKey) &&
        matchesModifier(kb.shift, e.shiftKey) &&
        matchesModifier(kb.alt, e.altKey)
    );
}

/** Number of pinned (non-null) modifiers - higher means more specific. */
function specificity(kb: Keybind): number {
    return [kb.ctrl, kb.shift, kb.alt].filter(m => m !== null && m !== undefined).length;
}

export class KeybindManager {
    private static readonly instance = new KeybindManager();
    private readonly actions = new Map<string, AbstractAction>();
    private readonly defaultKeybinds = new Map<string, Keybind | undefined>();
    /** null = user explicitly unbound the action; absent key = defer to default. */
    private readonly userKeybinds = new Map<string, Keybind | null>();
    private index = new Map<Key, ResolvedBinding[]>();
    private indexDirty = true;

    public static getInstance(): KeybindManager {
        return KeybindManager.instance;
    }

    /**
     * Registers an action with the manager.
     *
     * @param action the action to register
     * @param defaultKeybind explicit default for this registration; falls
     *   back to `action.getDefaultKeybinding()` when undefined. Kept as a
     *   separate parameter so the same action class can be registered
     *   multiple times (e.g. per-instance commands) with different defaults.
     */
    registerAction(action: AbstractAction, defaultKeybind: Keybind | null): void {
        const id = action.getId();
        if (this.actions.has(id)) {
            throw new Error(`Action with id "${id}" is already registered.`);
        }

        this.actions.set(id, action);
        this.defaultKeybinds.set(id, defaultKeybind ?? action.getDefaultKeybinding() ?? undefined);
        this.indexDirty = true;
    }

    unregisterAction(action: AbstractAction): void {
        const id = action.getId();
        this.actions.delete(id);
        this.defaultKeybinds.delete(id);
        this.userKeybinds.delete(id);
        this.indexDirty = true;
    }

    /**
     * Sets a user override for an action's keybind.
     * Pass `undefined` to explicitly unbind the action (distinct from
     * `resetKeybind`, which reverts to the default instead of unbinding).
     */
    setKeybind(id: string, newKeybind: Keybind | undefined): void {
        if (!this.actions.has(id)) {
            throw new Error(`Cannot set keybind: no action registered with id "${id}".`);
        }
        this.userKeybinds.set(id, newKeybind ?? null);
        this.indexDirty = true;
    }

    /** Reverts an action to its default keybind, discarding any user override. */
    resetKeybind(id: string): void {
        this.userKeybinds.delete(id);
        this.indexDirty = true;
    }

    /** The keybind currently in effect for an action, or undefined if unbound. */
    getEffectiveKeybind(id: string): Keybind | undefined {
        if (this.userKeybinds.has(id)) {
            const override = this.userKeybinds.get(id);
            return override === null ? undefined : override;
        }
        return this.defaultKeybinds.get(id);
    }

    /**
     * Public helper: returns true when the given DOM event matches the
     * provided keybind (key + modifiers). Useful for custom handling or
     * testing without going through the manager's dispatch pipeline.
     */
    public static eventMatchesKeybind(kb: Keybind, event: KeyboardEvent | MouseEvent): boolean {
        const key = event instanceof KeyboardEvent ? keyFromKeyboardEvent(event) : keyFromMouseEvent(event);
        if (key === undefined) return false;
        if (key !== kb.key) return false;
        return modifiersMatch(kb, event);
    }

    onKeydown(ctx: KeybindContext): void {
        const event = ctx.getEvent();
        if (!(event instanceof KeyboardEvent)) return;

        const key = keyFromKeyboardEvent(event);
        if (key === undefined) return;

        this.dispatch(this.resolveCandidates(key, event), ctx);
    }

    onMousedown(ctx: KeybindContext): void {
        const event = ctx.getEvent();
        if (!(event instanceof MouseEvent)) return;

        const key = keyFromMouseEvent(event);
        if (key === undefined) return;

        this.dispatch(this.resolveCandidates(key, event), ctx);
    }

    private rebuildIndex(): void {
        this.index = new Map();

        for (const [id, action] of this.actions) {
            const keybind = this.getEffectiveKeybind(id);
            if (!keybind) continue;

            const source: "user" | "default" = this.userKeybinds.has(id) ? "user" : "default";
            const binding: ResolvedBinding = {action, keybind, source};

            const bucket = this.index.get(keybind.key);
            if (bucket) bucket.push(binding);
            else this.index.set(keybind.key, [binding]);
        }

        this.indexDirty = false;
    }

    /**
     * Resolves all bindings on a key that structurally match the event's
     * modifiers, ordered by:
     *   1. source - user overrides before defaults, since an explicit
     *      user assignment should win over an incidental default collision
     *      on the same key
     *   2. priority - lower runs first (this is what lets two actions like
     *      "generate constructor" / "open code menu" share Alt+C and be
     *      tried in a defined order)
     *   3. specificity - exact modifier matches before wildcard (null)
     *      modifiers, so a pinned `shift: true` binding isn't shadowed by
     *      an unrelated `shift: null` binding on the same key
     */
    private resolveCandidates(key: Key, event: KeyboardEvent | MouseEvent): ResolvedBinding[] {
        if (this.indexDirty) this.rebuildIndex();

        const bucket = this.index.get(key) ?? [];
        return bucket
            .filter(b => modifiersMatch(b.keybind, event))
            .sort((a, b) => {
                if (a.source !== b.source) return a.source === "user" ? -1 : 1;

                const pa = a.keybind.priority ?? 0;
                const pb = b.keybind.priority ?? 0;
                if (pa !== pb) return pa - pb;

                return specificity(b.keybind) - specificity(a.keybind);
            });
    }

    /**
     * Tries each candidate in order. An action can call `ctx.abort()` from
     * within `run()` to signal it isn't actually applicable right now
     * (e.g. cursor isn't in a class body), which falls through to the
     * next candidate on the same key.
     */
    private dispatch(candidates: ResolvedBinding[], ctx: KeybindContext): void {
        for (const {action} of candidates) {
            if (!ctx.applies(action.getKeybindContext())) continue;

            try {
                action.run(ctx);
                return;
            } catch (err) {
                if (err instanceof KeybindNotApplicableAbortError) {
                    continue;
                }
                throw err;
            }
        }
    }
}