import {Fragment} from "./Fragment";

export class FragmentEvent {
    constructor(public type: FragmentType, private fragment: Fragment | null, public pos: Offset) {
    }

    public static start(fragment: Fragment) {
        return new FragmentEvent(FragmentType.START_RANGE, fragment, fragment.getRange().start);
    }

    public static end(fragment: Fragment) {
        return new FragmentEvent(FragmentType.END_RANGE, fragment, fragment.getRange().end);
    }

    static inlay(pos: Offset) {
        return new FragmentEvent(FragmentType.INLAY, null, pos);
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
