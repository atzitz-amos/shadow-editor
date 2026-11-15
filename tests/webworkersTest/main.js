import { ProcessManager } from "../../src/core/threaded/process/manager/ProcessManager";
// @ts-ignore
import { FloatSumProcessor, SumProcessor } from "./sumProcessor";
export async function main() {
    const manager = new ProcessManager();
    const task1 = manager.launch(SumProcessor.executable(1e9, "d"));
    const task2 = manager.launch(SumProcessor.executable(1e9, "d"));
    const task3 = manager.launch(FloatSumProcessor.executable(1e9));
    for (let i = 0; i < 3; i++) {
        const task = [task1, task2, task3][i];
        let baseSelector = ".c" + (i + 1) + " ";
        document.querySelector(baseSelector + ".process-name").innerText = task.getProcessName();
        task.addProgressListener(progress => {
            document.querySelector(baseSelector + ".progress-bar").value = (progress * 100);
            document.querySelector(baseSelector + ".progress-text").innerText = (Math.round(progress * 100) + "%");
        });
        task.whenComplete(result => {
            document.querySelector(baseSelector + ".footer-time").style.display = "block";
            document.querySelector(baseSelector + ".progress-bar").value = 100;
            document.querySelector(baseSelector + ".progress-text").innerText = "100%";
            document.querySelector(baseSelector + ".result").innerText = "Result: " + result.toString();
            document.querySelector(baseSelector + ".completion-time").innerText = (task.getCompletionTime() + "ms");
        });
    }
}
