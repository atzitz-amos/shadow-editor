/*
 * Author: Atzitz Amos
 * Date: 10/6/2025
 */

import {HighlightHolder} from "../../../editor/ui/highlighter/HighlightHolder";
import {Token} from "../tokens/Token";

export abstract class HighlighterBase {
    abstract performHighlighting(holder: HighlightHolder, token: Token): void;
}
