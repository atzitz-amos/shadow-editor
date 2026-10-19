import {ProcessMonitor} from "./ProcessMonitor";
import {ProcessExecutable} from "../ProcessExecutable";
import {ProcessLauncherUtils} from "../ProcessLauncherUtils";
import {WCP} from "../../wcp/api/WCP";

export class ProcessManager {
    private processes: ProcessMonitor[] = [];

    public launch(executable: ProcessExecutable): ProcessMonitor {
        const worker = WCP.createWorker(executable.getProcess());
        const monitor = new ProcessMonitor(executable, worker);

        this.processes.push(monitor);

        ProcessLauncherUtils.launch(worker, executable, monitor);

        return monitor;
    }
}