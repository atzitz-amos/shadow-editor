/**
 *
 * @author Atzitz Amos
 * @date 8/17/2026
 * @since 1.0.0
 */

export type UndoFrameAction = {
    kind: 'insert' | 'delete';
    offset: Offset;
    text: string;
}