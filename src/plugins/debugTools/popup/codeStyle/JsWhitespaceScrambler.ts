/**
 * JsWhitespaceScrambler
 * ======================
 * Takes syntactically valid JavaScript source and re-emits it with the
 * exact same tokens, but randomized whitespace: spacing, indentation,
 * and blank lines are all scrambled while a handful of "unsafe" spots
 * (ASI hazards, arrow-function `=>`, private class fields, template
 * literal internals, etc.) are protected so the output always parses to
 * the SAME program.
 *
 * Useful as ugly/adversarial test input for a code formatter.
 *
 * Requires the `acorn` package (a real JS/TS-lite tokenizer):
 *   npm install acorn
 *
 * Usage:
 *   import { JsWhitespaceScrambler } from "./JsWhitespaceScrambler";
 *
 *   const scrambler = new JsWhitespaceScrambler(); // random seed
 *   const ugly = scrambler.scramble(prettySourceCode);
 *
 *   const reproducible = new JsWhitespaceScrambler(42).scramble(source);
 */

import type {Comment, Program} from "acorn";
import * as acorn from "acorn";

interface Piece {
    kind: "token" | "comment";
    /** acorn TokenType label, e.g. "name", "num", "=>", "return" — only set for tokens */
    tokenType?: string;
    /** true for `//` line comments, false for `/* *\/` block comments — only set for comments */
    isLineComment?: boolean;
    start: number;
    end: number;
}

interface GapRules {
    minSpaces: number;
    allowNewline: boolean;
    forceNewline: boolean;
    forceZero: boolean;
}

export class JsWhitespaceScrambler {
    private static readonly OPCHARS = new Set("+-*/%<>=!&|^~?.:".split(""));
    private static readonly RESTRICTED_KEYWORDS = new Set([
        "return",
        "throw",
        "break",
        "continue",
        "yield",
    ]);

    private seed: number;

    /**
     * @param seed Optional PRNG seed for reproducible scrambling. Defaults to
     * a time-based seed (non-reproducible) if omitted.
     */
    constructor(seed: number = Date.now()) {
        const normalized = Math.abs(Math.trunc(seed)) % 0x7fffffff;
        this.seed = normalized || 1;
    }

    /**
     * Returns `source` re-formatted with randomized (but safe) whitespace.
     * The token stream of the output is guaranteed to be identical to the
     * token stream of the input — only spacing, indentation, and blank
     * lines change.
     */
    scramble(source: string): string {
        const protectedSpans = this.findProtectedSpans(source);
        const pieces = this.collectPieces(source);

        let out = "\n".repeat(this.randInt(0, 2));

        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i];
            out += source.slice(piece.start, piece.end);

            if (i === pieces.length - 1) break;
            const next = pieces[i + 1];

            if (
                this.insideAnySpan(piece.start, protectedSpans) &&
                this.insideAnySpan(next.start, protectedSpans)
            ) {
                // never scramble inside a template literal — copy the gap verbatim
                out += source.slice(piece.end, next.start);
                continue;
            }

            const rules = this.gapRules(source, piece, next);
            out += this.randomGap(rules);
        }

        out += "\n";
        return out;
    }

    // ---------------------------------------------------------------------
    // Seeded PRNG
    // ---------------------------------------------------------------------

    private rand(): number {
        this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
        return this.seed / 0x7fffffff;
    }

    private randInt(min: number, max: number): number {
        return Math.floor(this.rand() * (max - min + 1)) + min;
    }

    private pick<T>(arr: T[]): T {
        return arr[this.randInt(0, arr.length - 1)];
    }

    // ---------------------------------------------------------------------
    // Parsing helpers
    // ---------------------------------------------------------------------

    /** Parses as a module when possible (to support import/export), falling back to a plain script. */
    private parseLeniently(source: string, onComment?: Comment[]): { ast: Program; sourceType: "module" | "script" } {
        try {
            const ast = acorn.parse(source, {
                ecmaVersion: "latest",
                sourceType: "module",
                onComment,
            });
            return {ast, sourceType: "module"};
        } catch {
            onComment?.splice(0, onComment.length);
            const ast = acorn.parse(source, {
                ecmaVersion: "latest",
                sourceType: "script",
                onComment,
            });
            return {ast, sourceType: "script"};
        }
    }

    /** Spans of every TemplateLiteral node — copied byte-for-byte, never scrambled inside. */
    private findProtectedSpans(source: string): Array<[number, number]> {
        const {ast} = this.parseLeniently(source);
        const spans: Array<[number, number]> = [];

        const walk = (node: any): void => {
            if (!node || typeof node.type !== "string") return;
            if (node.type === "TemplateLiteral") {
                spans.push([node.start, node.end]);
                return; // don't descend — the whole literal is atomic
            }
            for (const key in node) {
                if (key === "start" || key === "end" || key === "loc" || key === "range") continue;
                const val = node[key];
                if (Array.isArray(val)) {
                    for (const item of val) {
                        if (item && typeof item.type === "string") walk(item);
                    }
                } else if (val && typeof val.type === "string") {
                    walk(val);
                }
            }
        };

        walk(ast);
        return spans;
    }

    private insideAnySpan(pos: number, spans: Array<[number, number]>): boolean {
        return spans.some(([s, e]) => pos >= s && pos < e);
    }

    /** Tokens + comments, merged and sorted into one ordered list of "pieces". */
    private collectPieces(source: string): Piece[] {
        const comments: Comment[] = [];
        const {sourceType} = this.parseLeniently(source, comments);

        const tokens: Piece[] = [];
        for (const tok of acorn.tokenizer(source, {ecmaVersion: "latest", sourceType})) {
            tokens.push({
                kind: "token",
                tokenType: tok.type.label,
                start: tok.start,
                end: tok.end,
            });
        }

        const commentPieces: Piece[] = comments.map((c) => ({
            kind: "comment",
            isLineComment: c.type === "Line",
            start: c.start,
            end: c.end,
        }));

        return [...tokens, ...commentPieces].sort((a, b) => a.start - b.start);
    }

    private pieceText(source: string, p: Piece): string {
        return source.slice(p.start, p.end);
    }

    private isWordChar(ch: string | undefined): boolean {
        return ch != null && /[A-Za-z0-9_$]/.test(ch);
    }

    // ---------------------------------------------------------------------
    // Whitespace-merge safety rules — decide what's ALLOWED in a gap
    // ---------------------------------------------------------------------

    private gapRules(source: string, prev: Piece, next: Piece): GapRules {
        const prevText = this.pieceText(source, prev);
        const nextText = this.pieceText(source, next);
        const lastCh = prevText[prevText.length - 1];
        const firstCh = nextText[0];

        // Line comments MUST be followed by a newline, or the next token would
        // be swallowed into the comment.
        if (prev.kind === "comment" && prev.isLineComment) {
            return {minSpaces: 0, allowNewline: true, forceNewline: true, forceZero: false};
        }

        // private class fields: `#foo` must never have a space after `#`
        if (lastCh === "#") {
            return {minSpaces: 0, allowNewline: false, forceNewline: false, forceZero: true};
        }

        let minSpaces = 0;
        let allowNewline = true;

        // word-char adjacency (identifiers/keywords/numbers running together)
        if (this.isWordChar(lastCh) && this.isWordChar(firstCh)) {
            minSpaces = 1;
        }

        // operator-char adjacency (avoid `+`+`+` becoming `++`, `<`+`=` becoming
        // `<=`, etc. when they were originally two separate tokens)
        if (JsWhitespaceScrambler.OPCHARS.has(lastCh) && JsWhitespaceScrambler.OPCHARS.has(firstCh)) {
            minSpaces = Math.max(minSpaces, 1);
        }

        // numeric literal directly followed by `.`
        if (prev.tokenType === "num" && firstCh === ".") {
            minSpaces = Math.max(minSpaces, 1);
        }

        // ASI restricted productions: no LineTerminator right after these
        // keywords before their operand
        if (
            prev.kind === "token" &&
            JsWhitespaceScrambler.RESTRICTED_KEYWORDS.has(prevText) &&
            nextText !== ";" &&
            nextText !== "}"
        ) {
            allowNewline = false;
            minSpaces = Math.max(minSpaces, 1);
        }

        // no LineTerminator between postfix ++/-- and its operand (conservative:
        // forbid a newline before any ++/-- token)
        if (nextText === "++" || nextText === "--") {
            allowNewline = false;
        }

        // no LineTerminator between `async` and what follows (function/arrow
        // params/method name)
        if (prevText === "async") {
            allowNewline = false;
            minSpaces = Math.max(minSpaces, 1);
        }

        // no LineTerminator between arrow-function params and `=>`
        if (nextText === "=>") {
            allowNewline = false;
        }

        // be conservative around get/set accessor keywords too
        if (prevText === "get" || prevText === "set") {
            allowNewline = false;
            minSpaces = Math.max(minSpaces, 1);
        }

        return {minSpaces, allowNewline, forceNewline: false, forceZero: false};
    }

    // ---------------------------------------------------------------------
    // Randomized whitespace generation
    // ---------------------------------------------------------------------

    private randomGap(rules: GapRules): string {
        if (rules.forceZero) return "";

        const wantNewline = rules.forceNewline || (rules.allowNewline && this.rand() < 0.22);

        if (wantNewline) {
            let out = "";
            // occasionally throw in a couple of blank lines for chaos
            const blankLines = this.rand() < 0.12 ? this.randInt(1, 3) : 0;
            // sometimes trailing whitespace dangling at the end of the previous line
            if (this.rand() < 0.15) out += this.pick([" ", "  ", "    "]);
            out += "\n".repeat(1 + blankLines);

            const indentStyle = this.pick(["spaces1", "spaces3", "spaces5", "tab", "tabspace", "none"]);
            switch (indentStyle) {
                case "spaces1":
                    out += " ".repeat(this.randInt(0, 2));
                    break;
                case "spaces3":
                    out += " ".repeat(this.randInt(3, 6));
                    break;
                case "spaces5":
                    out += " ".repeat(this.randInt(7, 12));
                    break;
                case "tab":
                    out += "    ".repeat(this.randInt(1, 3));
                    break;
                case "tabspace":
                    out += "    " + " ".repeat(this.randInt(1, 4));
                    break;
                case "none":
                    break;
            }
            return out;
        }

        // same-line spacing: sometimes cramped, sometimes sprawling, sometimes a stray tab
        if (rules.minSpaces === 0 && this.rand() < 0.35) return "";
        const style = this.pick(["one", "few", "many", "tab"]);
        let n: number;
        if (style === "one") n = 1;
        else if (style === "few") n = this.randInt(2, 3);
        else if (style === "many") n = this.randInt(4, 8);
        else return "    ";
        return " ".repeat(Math.max(n, rules.minSpaces));
    }
}
