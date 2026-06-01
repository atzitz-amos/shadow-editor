import {Disposable} from "../../../core/ui/api/Disposable";
import {Drawable} from "../../../core/ui/api/Drawable";
import {Closeable} from "../../../core/ui/api/Closeable";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export interface IPopup extends Closeable, Disposable, Drawable {
    open(x: number, y: number): void;

    move(x: number, y: number): void;

    getHeight(): number;

    getWidth(): number;

    measure(): DOMRect;

    isInBound(x: number, y: number, delta: number): boolean;
}
