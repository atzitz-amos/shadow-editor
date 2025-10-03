import {ProcessExecutable} from "./ProcessExecutable";
import {Process} from "./Process";
import {ProcessGateway} from "./ProcessGateway";
import {ProcessMonitor} from "./ProcessMonitor";

export class ProcessLauncherUtils {
    public static createWorker(executable: ProcessExecutable): Worker {
        const process = executable.getProcess();

        return new Worker(process.getLaunchURL(), {
            type: 'module'
        });
    }

    public static launch(worker: Worker, executable: ProcessExecutable, monitor: ProcessMonitor) {
        monitor.initialize(worker);
        worker.postMessage({
            cmd: "launch",
            process: executable.getName(),
            args: executable.getForwardedArgs()
        });
    }

    public static isWorkerThread(): boolean {
        return typeof self !== 'undefined' &&
            typeof (self as any).importScripts === 'function';
    }

    public static assertWorkerThread() {
        if (!this.isWorkerThread()) {
            throw new Error("Expected to be called from a worker thread.");
        }
    }

    static awaitCreation<T extends Process>(process: new () => T) {
        ProcessLauncherUtils.assertWorkerThread();

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