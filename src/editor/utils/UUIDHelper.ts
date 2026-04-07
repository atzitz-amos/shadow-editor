export class UUIDHelper {
    public static newUUID(): string {
        return crypto.randomUUID();
    }
}