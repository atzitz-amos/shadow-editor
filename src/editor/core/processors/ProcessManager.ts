import {ProcessMonitor} from "./ProcessMonitor";
import {ProcessExecutable} from "./ProcessExecutable";
import {ProcessLauncherUtils} from "./ProcessLauncherUtils";

export class ProcessManager {
    private processes: ProcessMonitor[] = [];

    public launch(executable: ProcessExecutable): ProcessMonitor {
        const worker = ProcessLauncherUtils.createWorker(executable);
        const monitor = new ProcessMonitor(executable, worker);

        this.processes.push(monitor);

        ProcessLauncherUtils.launch(worker, executable, monitor);

        return monitor;
    }
}