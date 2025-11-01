import {Fragment} from "./Fragment";
import {InlayWidget} from "../../../ui/inline/inlay/InlayWidget";

export class FragmentEvent {
    constructor(public type: FragmentType, private fragment: Fragment | null, public pos: Offset) {
    }

    public static start(fragment: Fragment) {
        return new FragmentEvent(FragmentType.START_RANGE, fragment, fragment.getRange().start);
    }

    public static end(fragment: Fragment) {
        return new FragmentEvent(FragmentType.END_RANGE, fragment, fragment.getRange().end);
    }

    static inlay(inlay: InlayWidget) {
        return new FragmentEvent(FragmentType.INLAY, null, inlay.getOffset());
    }

    getFragment(): Fragment {
        return this.fragment!;
    }
}

export enum FragmentType {
    START_RANGE,
    END_RANGE,
    INLAY
}
