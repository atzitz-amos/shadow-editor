import {Editor} from "../../Editor";
import {InlayWidget} from "../../ui/inline/inlay/InlayWidget";
import {InlayUtils} from "./InlayUtils";

export type InlayRecord = {
    offset: Offset,
    deltaOffset: number,
    width: number
}

export class InlayManager {
    private readonly inlays: InlayRecord[] = [];

    constructor(private editor: Editor) {

    }

    public addInlayWidget(inlay: InlayWidget) {
        this.addInlay(InlayUtils.toInlayRecord(inlay, this.editor));
    }

    /**
     * Add an InlayRecord to the inlay manager.
     */
    public addInlay(inlay: InlayRecord) {
        if (this.inlays.length === 0) {
            this.inlays.push(inlay);
            return;
        }
        for (let i = 0; i < this.inlays.length; i++) {
            if (this.inlays[i].offset === inlay.offset) {
                this.inlays[i] = inlay;
                return;
            }
            if (this.inlays[i].offset > inlay.offset) {
                this.inlays.splice(i, 0, inlay);
                return;
            }
        }
    }

    /**
     * Clear all InlayRecords
     */
    public clear(): void {
        this.inlays.length = 0;
    }

    /**
     * Get list of InlayRecords. This list is guaranteed to be sorted based on offset position.*/
    public getInlays(): InlayRecord[] {
        return this.inlays;
    }

    public getInlayAt(offset: Offset) {
        const inlays = this.inlays;
        let left = 0;
        let right = inlays.length - 1;

        while (left <= right) {
            const mid = (left + right) >> 1;
            const midOffset = inlays[mid].offset;

            if (midOffset === offset) {
                return inlays[mid];
            } else if (midOffset < offset) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return null;
    }
}