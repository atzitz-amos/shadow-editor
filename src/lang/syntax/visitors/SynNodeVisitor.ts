import {SynTokenNode} from "../impl/SynTokenNode";
import {SynErrorNode} from "../impl/SynErrorNode";
import {SynASTElement} from "../api/tree/SynASTElement";
import {SynFile} from "../api/filesystem/SynFile";
import {SynNode} from "../api/SynNode";
import {SynTree} from "../api/tree/SynTree";
import {SynCodeBlock} from "../api/SynCodeBlock";
import {SynNamedElement} from "../impl/reference/SynNamedElement";

/**
 *
 * @author Atzitz Amos
 * @date 11/25/2025
 * @since 1.0.0
 */
export class SynNodeVisitor {
    isRecursive(): boolean {
        return false;
    }

    visitNode(node: SynNode): void {
    }

    visitCodeblock(node: SynCodeBlock): void {
    }

    visitNamedElement(node: SynNamedElement): void {
    }

    visitTree(tree: SynTree): void {

    }

    visitFile(file: SynFile): void {
    }

    visitElement(element: SynASTElement): void {
        this.visitNode(element);
    }

    visitToken(token: SynTokenNode): void {
        this.visitNode(token);
    }

    visitError(error: SynErrorNode): void {
        this.visitNode(error);
    }

    visitExitNode(node: SynNode): void {

    }
}
