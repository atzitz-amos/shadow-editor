import {SynNode} from "../api/SynNode";
import {SourceModificationRecord} from "./SourceModificationRecord";
import {SynPrinter} from "./SynPrinter";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";

/**
 *
 * @author Atzitz Amos
 * @date 6/6/2026
 * @since 1.0.0
 */
export class SourceRewriter {
    public constructor(private readonly printer: SynPrinter) {
    }

    public rewriteWithSource(root: SynNode, source: string): string {
        // Sort them by decreasing position, so that we can replace them without affecting the positions of the remaining nodes
        const syntheticNodes = this.collectSynthetic(root)
            .sort((a, b) => b.getTextRange().start - a.getTextRange().start);
        let rewrittenSource = source;
        for (const node of syntheticNodes) {
            const newText = this.printer.print(node);
            const range = node.getTextRange();
            rewrittenSource = rewrittenSource.slice(0, range.start) + newText + rewrittenSource.slice(range.end);
        }

        return rewrittenSource;
    }

    private collectSynthetic(root: SynNode): SynNode[] {
        let result: SynNode[] = [];
        if (root.isSynElement() && root.isSynthetic()) {
            result.push(root);
        } else {
            for (const child of root.getChildren()) {
                result = result.concat(this.collectSynthetic(child));
            }
        }
        return result;
    }

    replace(text: string, range: TextRange, node: SynNode) {
        return text.slice(0, range.start) + this.printer.print(node) + text.slice(range.end);
    }
}
