export class ClipboardUtils {
    public static async copyToClipboard(text: string): Promise<boolean> {
        // Returns whether the copy operation was successful
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                console.error("Failed to copy to clipboard:", err);
                return false;
            }
        } else {
            // Fallback for older browsers
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed"; // Avoid scrolling to bottom
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();

            try {
                const successful = document.execCommand("copy");
                if (!successful) {
                    console.error("Fallback: Copy command was unsuccessful");
                }
                return successful;
            } catch (err) {
                console.error("Fallback: Oops, unable to copy", err);
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    }

    public static async getClipboardText(): Promise<string | null> {
        if (navigator.clipboard && navigator.clipboard.readText) {
            try {
                return await navigator.clipboard.readText();
            } catch (err) {
                console.error("Failed to read from clipboard:", err);
                return null;
            }
        } else {
            console.warn("Clipboard API not supported for reading");
            return null;
        }
    }
}
