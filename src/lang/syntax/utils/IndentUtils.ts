/**
 *
 * @author Atzitz Amos
 * @date 7/6/2026
 * @since 1.0.0
 */
export class IndentUtils {
    public static getIndentationSize(line: string) {
        return IndentUtils.getIndentationString(line).length;
    }

    public static getIndentationString(line: string): string {
        const match = line.match(/^\s*/);
        return match ? match[0] : '';
    }

    public static indent(text: string, amount: number = 1, indentSize: number = 4): string {
        return ' '.repeat(indentSize * amount) + text;
    }

    public static dedent(text: string, amount: number = 1, indentSize: number = 4): string {
        return text.replace(new RegExp(`^ {0,${indentSize * amount}}`), '');
    }

    public static align(text: string, reference: string): string {
        return IndentUtils.getIndentationString(reference) + text;
    }

    static isAtLineBegin(line: string, caretOffset: Offset) {
        const indentation = IndentUtils.getIndentationString(line);
        return caretOffset <= indentation.length;
    }

    static makeIndentString(n: number) {
        return " ".repeat(n);
    }

    static startsWith(text: string, char: string) {
        return text.trimStart().startsWith(char);
    }

    static getAlignIndent(lines: string[]) {
        return Math.min(...lines.map(line => IndentUtils.getIndentationSize(line)));
    }
}
