/**
 *
 * @author Atzitz Amos
 * @date 3/17/2026
 * @since 1.0.0
 */
export type RelativePathInput = string | string[] | RelativePath;

export interface RelativePathFormatOptions {
    /** When true, renders as "./a/b" for non-empty paths. Default: false ("a/b"). */
    leadingDot?: boolean;
    /** When true, always renders "." for empty path. Default: false (""). */
    dotForEmpty?: boolean;
}

export interface RelativePathNormalizationOptions {
    /** When true, attempts to go above the empty path via ".." throws. Default: true. */
    forbidAboveRoot?: boolean;
    /** When true, allows empty segments from segments[] inputs (they will be ignored). Default: true. */
    ignoreEmptySegments?: boolean;

    /**
     * When set, if the first segment of the input matches this string, it will be ignored.
     */
    ignoreRootName?: string;
}

/**
 * A normalized, immutable relative path (POSIX-style separators).
 *
 * Invariants:
 * - Always uses "/" as separator.
 * - No empty segments, no "." segments.
 * - ".." segments are resolved (unless they would go above the empty path).
 * - Empty path is represented as zero segments and formats to "" by default.
 */
export class RelativePath {
    private readonly segments: readonly string[];

    private constructor(segments: readonly string[]) {
        this.segments = segments;
    }

    /** Empty path (equivalent to current directory). */
    public static root(): RelativePath {
        return new RelativePath([""]);
    }

    /** Parse and normalize a relative path. */
    public static of(input: RelativePathInput, options: RelativePathNormalizationOptions = {}): RelativePath {
        if (input instanceof RelativePath) {
            return input;
        }

        const rawSegments = typeof input === "string" ? RelativePath.parseToSegments(input) : input;
        const normalized = RelativePath.normalizeSegments(rawSegments, options);
        return new RelativePath(normalized);
    }

    /**
     * Like {@link of} but guarantees a non-empty result.
     * Useful if you want to forbid passing "" or ".".
     */
    public static nonEmpty(input: RelativePathInput, options: RelativePathNormalizationOptions = {}): RelativePath {
        const p = RelativePath.of(input, options);
        if (p.isEmpty()) {
            throw new Error("RelativePath must be non-empty");
        }
        return p;
    }

    private static parseToSegments(input: string): string[] {
        // Accept both '/' and '\\' for convenience.
        const s = input.replace(/\\/g, "/").trim();
        if (s.length === 0 || s === ".") {
            return [];
        }
        if (s.startsWith("/")) {
            throw new Error(`RelativePath cannot be absolute: "${input}"`);
        }

        // Keep behavior simple/consistent: we do not support URI schemes here.
        if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) {
            throw new Error(`RelativePath cannot be a URI: "${input}"`);
        }

        // disallow windows drive-absolute like C:\\... or C:/...
        if (/^[a-zA-Z]:\/?/.test(s)) {
            throw new Error(`RelativePath cannot be a drive-absolute path: "${input}"`);
        }

        return s.split("/");
    }

    private static normalizeSegments(raw: readonly string[], options: RelativePathNormalizationOptions): string[] {
        const forbidAboveRoot = options.forbidAboveRoot !== false;
        const ignoreEmpty = options.ignoreEmptySegments !== false;
        const ignoreRootName = options.ignoreRootName;

        const out: string[] = [];
        for (const seg0 of raw) {
            const seg = seg0.trim();
            if (seg.length === 0) {
                if (ignoreEmpty) continue;
                throw new Error("RelativePath contains an empty segment");
            }
            if (seg === ".") {
                continue;
            }
            if (seg === "..") {
                if (out.length > 0) {
                    out.pop();
                    continue;
                }
                if (forbidAboveRoot) {
                    throw new Error("RelativePath resolves above root via '..'");
                }
                // If allowed, keep leading ..
                out.push("..");
                continue;
            }

            RelativePath.assertValidSegment(seg);
            out.push(seg);
        }

        if (ignoreRootName && out.length > 0 && out[0] === ignoreRootName) {
            out.shift();
        }

        return out;
    }

    private static assertValidSegment(segment: string): void {
        if (segment === "." || segment === "..") {
            throw new Error(`Invalid segment: "${segment}"`);
        }
        if (segment.includes("/")) {
            throw new Error(`Path segment must not contain '/': "${segment}"`);
        }
        if (segment.includes("\\")) {
            throw new Error(`Path segment must not contain '\\': "${segment}"`);
        }
        // NUL is never valid in JS strings for file names.
        if (segment.includes("\u0000")) {
            throw new Error("Path segment must not contain NUL");
        }
    }

    public isEmpty(): boolean {
        return this.segments.length === 0;
    }

    public depth(): number {
        return this.segments.length;
    }

    public getSegments(): readonly string[] {
        return this.segments;
    }

    public name(): string | undefined {
        return this.segments.length === 0 ? undefined : this.segments[this.segments.length - 1];
    }

    public parent(): RelativePath {
        if (this.segments.length === 0) {
            return this;
        }
        return new RelativePath(this.segments.slice(0, -1));
    }

    /**
     * Join one or more relative paths to this one.
     * Any ".." in the appended paths will be applied after concatenation.
     */
    public join(...parts: RelativePathInput[]): RelativePath {
        if (parts.length === 0) {
            return this;
        }

        const combined: string[] = [...this.segments];
        for (const p of parts) {
            const rp = RelativePath.of(p);
            combined.push(...rp.segments);
        }
        return new RelativePath(RelativePath.normalizeSegments(combined, {forbidAboveRoot: true}));
    }

    /** Resolve a child (single segment). */
    public child(name: string): RelativePath {
        RelativePath.assertValidSegment(name);
        return new RelativePath([...this.segments, name]);
    }

    /**
     * Returns a relative path from this path to the target path.
     * Example:
     * - base: "a/b" target: "a/c/d" => "../c/d"
     */
    public relativeTo(target: RelativePathInput): RelativePath {
        const t = RelativePath.of(target);
        const a = this.segments;
        const b = t.segments;

        let i = 0;
        while (i < a.length && i < b.length && a[i] === b[i]) {
            i++;
        }

        const ups = a.length - i;
        const result: string[] = [];
        for (let k = 0; k < ups; k++) result.push("..");
        result.push(...b.slice(i));
        return RelativePath.of(result);
    }

    public startsWith(prefix: RelativePathInput): boolean {
        const p = RelativePath.of(prefix);
        if (p.segments.length > this.segments.length) {
            return false;
        }
        for (let i = 0; i < p.segments.length; i++) {
            if (this.segments[i] !== p.segments[i]) {
                return false;
            }
        }
        return true;
    }

    public equals(other: RelativePathInput): boolean {
        const o = RelativePath.of(other);
        if (o.segments.length !== this.segments.length) {
            return false;
        }
        for (let i = 0; i < this.segments.length; i++) {
            if (this.segments[i] !== o.segments[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Deterministic ordering (lexicographic by segments then by length).
     * Returns -1, 0, 1 like String#localeCompare but without locales.
     */
    public compareTo(other: RelativePathInput): number {
        const o = RelativePath.of(other);
        const min = Math.min(this.segments.length, o.segments.length);
        for (let i = 0; i < min; i++) {
            if (this.segments[i] < o.segments[i]) return -1;
            if (this.segments[i] > o.segments[i]) return 1;
        }
        if (this.segments.length < o.segments.length) return -1;
        if (this.segments.length > o.segments.length) return 1;
        return 0;
    }

    // -----------------
    // Parsing/normalization helpers
    // -----------------

    public toString(options: RelativePathFormatOptions = {}): string {
        const core = this.segments.join("/");
        if (core.length === 0) {
            return options.dotForEmpty ? "." : "";
        }
        return options.leadingDot ? `./${core}` : core;
    }

    /** Same as toString() with defaults (useful when JSON.stringify-ing). */
    public toJSON(): string {
        return this.toString();
    }

    /**
     * A stable 32-bit hash (FNV-1a) for map keys/caching.
     * Not cryptographic.
     */
    public hash32(): number {
        // FNV-1a 32-bit
        let hash = 0x811c9dc5;
        const s = this.toString();
        for (let i = 0; i < s.length; i++) {
            hash ^= s.charCodeAt(i);
            hash = Math.imul(hash, 0x01000193);
        }
        return hash >>> 0;
    }
}

// Tiny internal runtime self-checks (safe to keep; no side effects in production builds).
// If your bundler strips this, great; otherwise it's minimal overhead.
(() => {
    const a = RelativePath.of("a//b/./c");
    if (a.toString() !== "a/b/c") throw new Error("RelativePath normalization failed");
    const b = RelativePath.of("a/b/../c");
    if (b.toString() !== "a/c") throw new Error("RelativePath .. resolution failed");
    const c = RelativePath.of("");
    if (c.toString() !== "") throw new Error("RelativePath empty formatting failed");
})();
