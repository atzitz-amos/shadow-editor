import {ProcessGateway} from "./ProcessGateway";
import {ProcessExecutable} from "./ProcessExecutable";
import {ProcessLauncherUtils} from "./ProcessLauncherUtils";
import {ThreadedUtils} from "../ThreadedUtils";
import {Launchable} from "../Launchable";

export abstract class Process implements Launchable{
    static executable<T extends new () => Process>(this: T, ...args: Tail<Parameters<InstanceType<T>['run']>>): ProcessExecutable {
        return new ProcessExecutable(this.name, new this(), args);
    }

    static listen<T extends Process>(this: new () => T) {
        if (ThreadedUtils.isWorkerThread()) {
            ProcessLauncherUtils.awaitCreation(this);
        }
    }

    abstract run(gateway: ProcessGateway | null, ...args: any[]): Promise<any>;

    abstract getWorkerScriptPath(): string;
}
