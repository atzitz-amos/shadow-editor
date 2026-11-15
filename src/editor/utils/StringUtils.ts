export class StringUtils {
    static indent(text: string, value: number = 4): string {
        const indent = ' '.repeat(value);
        return text.split('\n').map(line => indent + line).join('\n');
    }

    static capitalize(s: string) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
}