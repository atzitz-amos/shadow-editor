import {Editor} from "../../Editor";

export type InlayRecord = {
    offset: Offset,
    deltaOffset: number,
    width: number
}

export class InlayManager {
    private readonly inlays: InlayRecord[] = [];

    constructor(private editor: Editor) {

    }

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

    public clear(): void {
        this.inlays.length = 0;
    }

    public getInlays(): InlayRecord[] {
        return this.inlays;
    }

    public getInlayAt(offset: Offset) {
        for (let inlay of this.inlays) {
            if (inlay.offset === offset) {
                return inlay;
            }
            if (inlay.offset > offset) {
                break;
            }
        }
        return null;
    }
}