import {Token} from "../../lang/tokens/Token";

/**
 * A cache for the incremental parser that stores the current tokens and their states.
 *
 * @author Atzitz Amos
 * @date 10/18/2025
 * @since 1.0.0
 */
export class TokenCache {
    private readonly tokens: Token[] = [];

    constructor(initialTokens: Token[] = []) {
        this.tokens = initialTokens;
    }

    /** Find previous whitespace token at or before pos (search left from containing/insertion point). */
    findPreviousWhitespaceToken(pos: Offset): Offset {
        const idx = this.findIndexContainingOrBefore(pos);
        for (let i = idx - 1; i >= 0; i--) {
            if (this.tokens[i].getType().shouldSkip) return this.tokens[i].getRange().end;
        }
        return 0;
    }

    /** Find next whitespace token at or after pos (search right from containing/insertion point). */
    findNextWhitespaceToken(pos: Offset): Offset {
        const idx = this.findIndexContainingOrAfter(pos);
        for (let i = idx; i < this.tokens.length; i++) {
            if (this.tokens[i].getType().shouldSkip) return this.tokens[i].getRange().end;
        }
        if (!this.tokens.length) return 0;
        return this.tokens[this.tokens.length - 1].getRange().end;
    }

    /**
     * Replace all tokens overlapping [start, end) with newTokens, then shift all following tokens by deltaOffset.
     * Uses TextRange.delta(offset) in-place on affected tokens.
     */
    update(start: Offset, end: Offset, newTokens: Token[], deltaOffset: Offset): void {
        if (start >= end && newTokens.length === 0 && deltaOffset === 0) return;

        const startIdx = this.findFirstIndexWithEndGreaterThan(start);
        const endIdx = this.findFirstIndexWithStartGreaterOrEqual(end);

        // Fast-path: tokens array is empty -> just copy newTokens into it without any spread/apply
        if (this.tokens.length === 0) {
            this.tokens.length = newTokens.length;
            for (let i = 0; i < newTokens.length; i++) {
                this.tokens[i] = newTokens[i];
            }
        } else {
            // General path: build merged contents and overwrite the existing array object in-place.
            const before = this.tokens.slice(0, startIdx);
            const after = this.tokens.slice(endIdx);

            this.tokens.length = before.length + newTokens.length + after.length; // resize in-place

            let p = 0;
            for (let i = 0; i < before.length; i++) this.tokens[p++] = before[i];
            for (let i = 0; i < newTokens.length; i++) this.tokens[p++] = newTokens[i];
            for (let i = 0; i < after.length; i++) this.tokens[p++] = after[i];
        }

        // Shift ranges of tokens after the inserted tokens by deltaOffset (in-place)
        const shiftFrom = startIdx + newTokens.length;
        for (let i = shiftFrom; i < this.tokens.length; i++) {
            this.tokens[i].getRange().delta(deltaOffset);
        }
    }

    /** Return a read-only view */
    getTokens(): Token[] {
        return this.tokens;
    }

    // --------------------
    // Binary-search helpers
    // --------------------

    /** index of token containing pos, or nearest token to the left (insertion point - 1) */
    private findIndexContainingOrBefore(pos: Offset): number {
        let lo = 0, hi = this.tokens.length - 1;
        let result = -1;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            const r = this.tokens[mid].getRange();
            if (r.contains(pos)) return mid;
            if (r.start >= pos) { // <-- changed from `>` to `>=`
                hi = mid - 1;
            } else {
                result = mid;
                lo = mid + 1;
            }
        }
        return result;
    }

    /** index of token containing pos, or nearest token to the right (insertion point) */
    private findIndexContainingOrAfter(pos: Offset): number {
        let lo = 0, hi = this.tokens.length - 1;
        let candidate = this.tokens.length; // insertion point if none contains
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            const r = this.tokens[mid].getRange();
            if (r.contains(pos)) return mid;
            if (r.start > pos) {
                candidate = mid;
                hi = mid - 1;
            } else {
                lo = mid + 1;
            }
        }
        return Math.min(candidate, this.tokens.length);
    }

    /** first index whose token.range.end > pos  (first token that can overlap a range starting at pos) */
    private findFirstIndexWithEndGreaterThan(pos: Offset): number {
        let lo = 0, hi = this.tokens.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (this.tokens[mid].getRange().end > pos) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    }

    /** first index whose token.range.start >= pos (first token completely after or at pos) */
    private findFirstIndexWithStartGreaterOrEqual(pos: Offset): number {
        let lo = 0, hi = this.tokens.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (this.tokens[mid].getRange().start >= pos) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    }
}