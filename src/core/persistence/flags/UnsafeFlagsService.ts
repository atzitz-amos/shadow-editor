import {Service} from "../../threaded/service/Service";
import {UnsafeFlags} from "./UnsafeFlags";

/**
 *
 * @author Atzitz Amos
 * @date 5/31/2026
 * @since 1.0.0
 */
@Service
export class UnsafeFlagsService {
    private static readonly instance = new UnsafeFlagsService();

    private flags: number = 0;

    public static flag(flag: UnsafeFlags) {
        this.instance.flags |= flag;
    }

    public static unflag(flag: UnsafeFlags) {
        this.instance.flags &= ~flag;
    }

    public static isFlagSet(flag: UnsafeFlags): boolean {
        return (this.instance.flags & flag) !== 0;
    }

    public static getInstance() {
        return this.instance;
    }

    static clear(flag: UnsafeFlags) {
        const wasSet = this.isFlagSet(flag);
        this.unflag(flag);
        return wasSet;
    }

    begin() {
        window.addEventListener("beforeunload", e => {
            if (this.flags !== 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        })
    }
}
