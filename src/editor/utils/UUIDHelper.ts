export class UUIDHelper {
    public static generateUUID(): string {
        return crypto.randomUUID();
    }
}