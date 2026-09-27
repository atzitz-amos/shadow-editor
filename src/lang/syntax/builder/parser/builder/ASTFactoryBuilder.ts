import {ASTBuilder} from "./ASTBuilder";
import {SynNode} from "../../../api/SynNode";

/**
 * Just like a regular builder, but it is designed to only hold a single toplevel node
 *
 * @author Atzitz Amos
 * @date 9/24/2026
 * @since 1.0.0
 */
export class ASTFactoryBuilder extends ASTBuilder {
    public getFactoryRootElement(): SynNode {
        if (this.production.length != 1) {
            console.error(this.production);
            throw new Error(`ASTFactoryBuilder should only have a single toplevel node, but has ${this.production.length}`);
        }
        return this.production[0];
    }
}
