/**
 * An annotator interface for language-specific annotations.
 * This will run in the background to provide real-time feedback to the user as they code.
 *
 * @author Atzitz Amos
 * @date 11/12/2025
 * @since 1.0.0
 */
export interface Annotator {
    /**
     * Indicates whether this annotator provides real-time annotations.
     * Real-time annotators run immediately as the user types, providing instant feedback.
     * They should be kept concise and optimized to avoid performance issues.
     * Annotator that run in real-time will only receive the ASTTree of the current file being edited,
     * and not the parsed SyntaxTree.
     **/
    isRealTime(): boolean;
}
