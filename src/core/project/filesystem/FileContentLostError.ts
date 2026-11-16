/**
 * Thrown when reading a file whose metadata records some content, but whose stored content is missing or empty.
 * <p>
 * The metadata (in IndexedDB) and the content (in the Origin Private File System) are stored apart, and the browser
 * can clear one without the other. Reading such a file as empty would hide the loss, and the next save would make it
 * permanent, so the reader has to decide what to do: {@link ProjectFile.save} with an empty text accepts the loss.
 *
 * @author Atzitz Amos
 * @date 11/16/2026
 * @since 1.0.0
 */
export class FileContentLostError extends Error {
    constructor(readonly fileId: string,
                readonly path: string,
                /** Size of the content in bytes, as recorded by the metadata */
                readonly expectedSize: number) {
        super(`The stored content of ${path} is missing: ${expectedSize} bytes were recorded, none are stored`);
        this.name = "FileContentLostError";
    }
}
