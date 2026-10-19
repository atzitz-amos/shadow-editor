import {EditorPlugin} from "../../core/plugins/loader/Plugin";

/**
 *
 * @author Atzitz Amos
 * @date 10/6/2026
 * @since 1.0.0
 */
export default class RiscVAssemblyLangPlugin extends EditorPlugin {
    public getId(): string {
        return "riscv-assembly-lang";
    }
}
