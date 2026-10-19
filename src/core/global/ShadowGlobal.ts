import {GlobalState} from "./GlobalState";
import {ShadowApp} from "../../app/ShadowApp";
import {DistantGlobalState} from "./DistantGlobalState";

/**
 *
 * @author Atzitz Amos
 * @date 10/1/2026
 * @since 1.0.0
 */
export class ShadowGlobal {
    public static async init(app: ShadowApp): Promise<void> {
        GlobalState.init(app);
        DistantGlobalState.init();
    }
}
