import {Editor} from "./Editor";

export class EditorInstance {
    private static _isLocked = false;
    private static waiting: any[] = [];
    private static _count = 0;

    private static _INSTANCE: Editor | null = null;


    static get INSTANCE(): Editor {
        if (!EditorInstance._INSTANCE) {
            throw new Error("Editor instance not acquired yet. Please call EditorInstance.acquire(editor) first.");
        }
        return EditorInstance._INSTANCE;
    }

    static async acquireAsync(editor: Editor): Promise<void> {
        if (!this._INSTANCE && !this._isLocked) {
            this._isLocked = true;
            this._INSTANCE = editor;
            this._count = 0;
        } else {
            if (this._INSTANCE === editor) {
                this._count++;
                return; // No need to wait if the desired editor is already acquired
            }
            await new Promise<void>(resolve => this.waiting.push([editor, resolve]));
        }
    }

    static release(): void {
        if (this._count !== 0) {
            this._count--;
            return;
        }
        if (!this.waiting.length) {
            this._isLocked = false;
            this._INSTANCE = null;
        } else {
            const [nextEditor, resolve] = this.waiting.shift()!;
            this._INSTANCE = nextEditor;
            resolve();
        }
    }

    static async with(editor: Editor, callback: () => void): Promise<void> {
        await this.acquireAsync(editor)
        callback();
        this.release();
    }

    /**
     * Acquire an editor instance. This method should be called before every event triggered in the `Editor` class
     *
     *  WARNING: Usage of this method is highly discouraged as it is not thread-safe. Prefer using `with` or `acquireAsync` */
    static acquire(editor: Editor) {
        if (!this.waitForFlagSync()) {
            throw new Error("Error: Couldn't acquire editor instance in time. This is probably caused by an abnormal delay in an asynchronously running operation.");
        }

        this._INSTANCE = editor;
    }

    private static waitForFlagSync(maxWaitMs = 2000) {
        if (!this._INSTANCE && !this._isLocked) {
            return true;
        }

        console.warn(`Warning: Editor instance is already acquired. Waiting for it to be released for a maximum of ${maxWaitMs}ms...`);

        const start = Date.now();
        while (Date.now() - start < maxWaitMs) {
            if (!this._INSTANCE && !this._isLocked) {
                return true;
            }
        }
        return false; // timed out
    }

}