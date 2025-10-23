import {Document} from "../../core/document/Document";

export class CtrlMoveHelper {
    public static readonly DELIMITER = /[\s.,;:!?(){}\[\]<>/*-+%&]/;

    public static getOffsetToPreviousWord(doc: Document, pos: number, delimiter: RegExp): number {
        if (pos <= 0) return 0;
        let startPos = pos;
        let firstChar = doc.getCharAt(pos - 1);

        if (delimiter.test(firstChar)) {
            while (pos > 0 && doc.getCharAt(pos - 1) === firstChar) {
                pos--;
            }

            if (firstChar !== ' ') return pos - startPos;
        }

        while (pos > 0 && !delimiter.test(doc.getCharAt(pos - 1))) {
            pos--;
        }
        return pos - startPos;
    }

    public static getOffsetToNextWord(doc: Document, pos: number, delimiter: RegExp): number {
        if (pos >= doc.getTotalDocumentLength()) return 0;
        let startPos = pos;
        let firstChar = doc.getCharAt(pos);

        if (delimiter.test(firstChar)) {
            while (pos < doc.getTotalDocumentLength() && doc.getCharAt(pos) === firstChar) {
                pos++;
            }

            if (firstChar !== ' ') return pos - startPos;
        }

        while (pos < doc.getTotalDocumentLength() && !delimiter.test(doc.getCharAt(pos))) {
            pos++;
        }
        return pos - startPos;
    }
}