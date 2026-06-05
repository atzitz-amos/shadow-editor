import {SynNode} from "../api/SynNode";
import {SynTokenNode} from "../impl/SynTokenNode";
import {SynErrorNode} from "../impl/SynErrorNode";
import {SynElement} from "../api/SynElement";
import {SynFile} from "../api/SynFile";

/**
 *
 * @author Atzitz Amos
 * @date 11/25/2025
 * @since 1.0.0
 */
export class SynNodeVisitor {
    visitNode(node: SynNode): void {

    }

    visitFile(file: SynFile): void {
    }

    visitElement(element: SynElement): void {
        this.visitNode(element);
    }

    visitToken(token: SynTokenNode): void {
        this.visitNode(token);
    }

    visitError(error: SynErrorNode): void {
        this.visitNode(error);
    }
}
