/**
 *
 * @author Atzitz Amos
 * @date 8/15/2026
 * @since 1.0.0
 */
export class CodeStyleManager {

}

/**
 Spacing rule:
 - before rules: before '(' in CallExpr -> space
 - within rules: within CodeBlock if not CodeBlock.expanded -> no-space
 - around rules: around MATH_OPERATOR -> space
 - after rules:  after ',' in CommaExpr -> space
 */


/**
 (. aaa .)
 {. aaa .}
 [. aaa .]

 .+.
 .,.

 if.(.x.==.1.).{
 d.(.1.,.function w.(..).{
 return.1;
 }.).;
 }

 */