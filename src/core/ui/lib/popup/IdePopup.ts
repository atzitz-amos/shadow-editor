/**
 *
 * @author Atzitz Amos
 * @date 6/17/2026
 * @since 1.0.0
 */
export interface IdePopup {
    open(parent: HTMLElement): void;

    close(isCancelled: boolean): void;

    isOpen(): boolean;

    onClose(callback: (wasCancelled: boolean) => void): void;

    containsXY(x: number, y: number): boolean;
}


export interface IdeResultPopup<R> extends IdePopup {
    awaitResult(): Promise<R | null>;

    getResult(): R | null;
}

export abstract class AbstractPopup implements IdePopup {
    private readonly closeCallbacks: ((wasCancelled: boolean) => void)[] = [];
    private activeElement: HTMLElement | null = null;

    close(isCancelled: boolean): void {
        if (this.activeElement) {
            this.closeCallbacks.forEach(callback => callback(isCancelled));

            this.activeElement.remove();
            this.activeElement = null;
        }
    }

    open(parent: HTMLElement): void {
        if (!this.activeElement) {
            this.closeCallbacks.length = 0;

            this.activeElement = this.getPopupElement();
            this.activeElement.classList.add('ide-popup');

            this.onClose(this.setupDragging(this.activeElement));
            parent.appendChild(this.activeElement);
        }
    }

    isOpen(): boolean {
        return this.activeElement !== null;
    }

    onClose(callback: (wasCancelled: boolean) => void): void {
        this.closeCallbacks.push(callback);
    }

    containsXY(x: number, y: number): boolean {
        if (!this.activeElement) return false;

        const rect = this.activeElement.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }

    protected abstract getPopupElement(): HTMLElement;

    private setupDragging(element: HTMLElement) {
        let isDragging: boolean = false;
        let offsetX: number = 0;
        let offsetY: number = 0;

        const onMouseUp = () => {
            isDragging = false;
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            let clientX = e.clientX - offsetX;
            let clientY = e.clientY - offsetY;

            const parentRect = document.body.getBoundingClientRect();

            const maxClientX = parentRect.width - element.getBoundingClientRect().width - 5;
            const maxClientY = parentRect.height - element.getBoundingClientRect().height - 5;

            clientX = Math.max(5, Math.min(clientX, maxClientX));
            clientY = Math.max(5, Math.min(clientY, maxClientY));

            element.style.left = `${clientX}px`;
            element.style.top = `${clientY}px`;
        };

        const onMouseDown = (e) => {
            e.preventDefault();
            e.stopPropagation();

            isDragging = true;

            if (window.getComputedStyle(element).transform !== 'none') {
                const rect = element.getBoundingClientRect();
                const parentRect = element.parentElement ? element.parentElement.getBoundingClientRect() : {
                    left: 0,
                    top: 0
                };

                element.style.left = `${rect.left - parentRect.left}px`;
                element.style.top = `${rect.top - parentRect.top}px`;

                element.style.transform = 'none';
            }

            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
        };

        element.addEventListener('mousedown', onMouseDown);

        document.addEventListener('mousemove', onMouseMove);

        document.addEventListener('mouseup', onMouseUp);

        return () => {
            element.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }
}