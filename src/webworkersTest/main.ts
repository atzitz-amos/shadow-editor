import {ProcessManager} from "../editor/core/process/ProcessManager";
import {FloatSumProcessor, SumProcessor} from "./sumProcessor";
import {ProcessMonitor} from "../editor/core/process/ProcessMonitor";

export async function main() {
    const manager = new ProcessManager();
    const task1: ProcessMonitor = manager.launch(SumProcessor.executable(1e9));
    const task2: ProcessMonitor = manager.launch(SumProcessor.executable(1e9));
    const task3: ProcessMonitor = manager.launch(FloatSumProcessor.executable(1e9));

    for (let i = 0; i < 3; i++) {
        const task = [task1, task2, task3][i];
        let baseSelector = ".c" + (i + 1) + " ";
        (document.querySelector(baseSelector + ".process-name") as HTMLHeadingElement)!.innerText = task.getProcessName();
        task.addProgressListener(progress => {
            (document.querySelector(baseSelector + ".progress-bar") as HTMLProgressElement).value = (progress * 100);
            (document.querySelector(baseSelector + ".progress-text") as HTMLSpanElement).innerText = (Math.round(progress * 100) + "%");
        });

        task.whenComplete(result => {
            (document.querySelector(baseSelector + ".footer-time") as HTMLDivElement).style.display = "block";
            (document.querySelector(baseSelector + ".progress-bar") as HTMLProgressElement).value = 100;
            (document.querySelector(baseSelector + ".progress-text") as HTMLSpanElement).innerText = "100%";
            (document.querySelector(baseSelector + ".result") as HTMLSpanElement).innerText = "Result: " + result.toString();
            (document.querySelector(baseSelector + ".completion-time") as HTMLSpanElement).innerText = (task.getCompletionTime() + "ms");
        });

    }
}