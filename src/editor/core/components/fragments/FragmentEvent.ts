import {Fragment} from "./Fragment";

export class FragmentEvent {
    constructor(public type: FragmentType, public fragment: Fragment, public pos: Offset) {
    }

    public static start(fragment: Fragment) {
        return new FragmentEvent(FragmentType.START, fragment, fragment.getRange().start);
    }

    public static end(fragment: Fragment) {
        return new FragmentEvent(FragmentType.END, fragment, fragment.getRange().end);
    }
}

export enum FragmentType {
    START,
    END
}
