import {ObjectType} from "./ObjectType";
import {StringUtils} from "../../../../../editor/utils/StringUtils";

/**
 *
 * @author Atzitz Amos
 * @date 11/11/2026
 * @since 1.0.0
 */
export class GitObject {

    constructor(public readonly type: ObjectType, public readonly content: Uint8Array) {

    }

    public toString(): string {
        return `Git${StringUtils.capitalize(this.type)}(contentLength=${this.content.length})`;
    }
}
