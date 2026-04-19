/*
 * Author: Atzitz Amos
 * Date: 10/6/2025
 */

import {LangService} from "../../../editor/core/lang/LangService";
import {TokenStream} from "../syntax/builder/tokens/TokenStream";
import {HighlightHolder} from "../../../editor/ui/highlighter/HighlightHolder";

export class IncrementalHighlighter {
    service: LangService;

    constructor(service: LangService) {
        this.service = service;
    }

    highlight(stream: TokenStream, holder: HighlightHolder) {
        let highlighter = this.service.getHighlighter()!;
        for (const token of stream.exhaust()) {
            highlighter.performHighlighting(holder, token);
        }
    }
}
