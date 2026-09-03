/*
 * Author: Atzitz Amos
 * Date: 10/6/2025
 */

import {TokenStream} from "../syntax/builder/tokens/TokenStream";
import {HighlightHolder} from "../../editor/ui/highlighter/HighlightHolder";
import {HighlighterBase} from "./HighlighterBase";

export class IncrementalHighlighter {
    constructor(private readonly highlighter: HighlighterBase) {
    }

    highlight(stream: TokenStream, holder: HighlightHolder) {
        for (const token of stream.exhaust()) {
            if (token.shouldSkip()) continue;
            this.highlighter.performHighlighting(holder, token);
        }
    }
}
