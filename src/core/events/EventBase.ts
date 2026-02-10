import {BubbleDirection} from "./BubbleDirection";

/**
 * Represents an event
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export interface EventBase {
    getBubbleDirection(): BubbleDirection;
}
