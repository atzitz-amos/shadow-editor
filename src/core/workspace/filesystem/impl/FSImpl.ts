/**
 *
 * @author Atzitz Amos
 * @date 3/17/2026
 * @since 1.0.0
 */
export class FSImpl {

    public static async createVirtualRootHandle(name: string): Promise<FileSystemDirectoryHandle> {
        const handle = await navigator.storage.getDirectory();
        return await handle.getDirectoryHandle(name, {create: true});
    }

    public static async createSubDir(parent: FileSystemDirectoryHandle, name: string): Promise<FileSystemDirectoryHandle> {
        return await parent.getDirectoryHandle(name, {create: true});
    }

    public static async createFile(parent: FileSystemDirectoryHandle, name: string): Promise<FileSystemFileHandle> {
        return await parent.getFileHandle(name, {create: true});
    }

    public static async deleteEntry(parent: FileSystemDirectoryHandle, name: string): Promise<void> {
        await parent.removeEntry(name);
    }
}
