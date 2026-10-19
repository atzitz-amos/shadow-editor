import {ProcessExecutable} from "./ProcessExecutable";
import {Process} from "./Process";
import {ProcessGateway} from "./ProcessGateway";
import {ProcessMonitor} from "./manager/ProcessMonitor";
import {ThreadedUtils} from "../ThreadedUtils";
import {WorkerRemote} from "../wcp/remote/WorkerRemote";

export class ProcessLauncherUtils {
    public static launch(remote: WorkerRemote, executable: ProcessExecutable, monitor: ProcessMonitor) {
        monitor.initialize(remote);
        remote.getWorker().postMessage({
            cmd: "launch",
            process: executable.getName(),
            args: executable.getForwardedArgs()
        });
    }

    static awaitCreation<T extends Process>(process: new () => T) {
        ThreadedUtils.assertWorkerThread();

        self.addEventListener("message", event => {
            let data = event.data;
            if (data && data.cmd === "launch" && data.process === process.name) {
                ProcessLauncherUtils.doLaunch(process, data.args);
            }
        }, true)
    }

    private static doLaunch<T extends Process>(process: new () => T, args: any[]) {
        const gateway = new ProcessGateway();
        const instance = new process();
        gateway.initializeAndRun(instance, args);
    }
}