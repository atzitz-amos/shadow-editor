/**
 * Represents a parsed stack frame from an Error stack trace.
 */
export interface StackFrame {
    /** Function/constructor name (e.g. "new JSLangPlugin "), empty string if anonymous */
    fn: string;
    /** Display label (e.g. "JSLangPlugin.ts:3:14") */
    label: string;
    /** Clean URL suitable for linking */
    url: string;
}

/**
 * Utilities for parsing JavaScript Error stack traces.
 *
 * @author Atzitz Amos
 * @date 2/19/2026
 * @since 1.0.0
 */
export class StackTraceParser {

    /**
     * Extract all "at ..." lines from a stack trace string.
     */
    static extractFrameLines(stack: string): string[] {
        return stack.split('\n').filter(l => l.trim().startsWith('at '));
    }

    /**
     * Parse a single stack trace line like:
     *   "at new JSLangPlugin (http://localhost:5173/src/plugins/jsLang/JSLangPlugin.ts?t=123:3:14)"
     *   "at http://localhost:5173/src/app/ShadowApp.ts:42:10"
     * into a StackFrame.
     */
    static parseFrame(line: string): StackFrame | null {
        const trimmed = line.trim();

        // Pattern: "at FuncName (url:line:col)"
        const withFn = trimmed.match(/^at\s+(.+?)\s+\((.+?)\)$/);
        if (withFn) {
            const fn = withFn[1] + ' ';
            const fullUrl = withFn[2];
            return {fn, label: StackTraceParser.formatUrl(fullUrl), url: StackTraceParser.cleanUrl(fullUrl)};
        }

        // Pattern: "at url:line:col" (no function name)
        const withoutFn = trimmed.match(/^at\s+(https?:\/\/.+)$/);
        if (withoutFn) {
            const fullUrl = withoutFn[1];
            return {fn: '', label: StackTraceParser.formatUrl(fullUrl), url: StackTraceParser.cleanUrl(fullUrl)};
        }

        return null;
    }

    /**
     * Extract "filename.ts:line:col" from a full URL like
     * "http://localhost:5173/src/plugins/jsLang/JSLangPlugin.ts?t=123:3:14"
     */
    static formatUrl(url: string): string {
        const match = url.match(/\/([^/?]+?)(?:\?[^:]*)?(:[\d]+:[\d]+)$/);
        if (match) {
            return match[1] + match[2];
        }
        const fallback = url.match(/\/([^/]+)$/);
        return fallback ? fallback[1] : url;
    }

    /**
     * Strip cache-busting query strings from a URL for a clean link.
     * "http://localhost:5173/src/foo.ts?t=123:3:14" -> "http://localhost:5173/src/foo.ts:3:14"
     */
    static cleanUrl(url: string): string {
        return url.replace(/\?[^:]*/, '');
    }
}

