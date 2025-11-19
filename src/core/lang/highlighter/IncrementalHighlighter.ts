/*
 * Author: Atzitz Amos
 * Date: 10/6/2025
 */

import {LangService} from "../../../editor/core/lang/LangService";
import {TokenStream} from "../tokens/TokenStream";
import {HighlightHolder} from "../../../editor/ui/highlighter/HighlightHolder";

export class IncrementalHighlighter {
    service: LangService;

    constructor(service: LangService) {
        this.service = service;
    }

    highlight(stream: TokenStream, holder: HighlightHolder) {
        for (const token of stream.exhaust()) {
            this.service.getHighlighter()?.performHighlighting(holder, token);
        }
    }
}
