import { Process } from "../../src/core/threaded/process/Process";
export class SumProcessor extends Process {
    getWorkerScriptPath() {
        return import.meta.url;
    }
    async run(gateway, until, a) {
        let sum = 0;
        for (let i = 0; i < until; i++) {
            sum += i;
            if (i % 100000 === 0)
                gateway.notifyProgress(i / until);
        }
        return sum;
    }
}
export class FloatSumProcessor extends Process {
    getWorkerScriptPath() {
        return import.meta.url;
    }
    async run(gateway, untilForFloat) {
        let sum = 0;
        for (let i = 0; i < untilForFloat; i++) {
            sum += i * 1.5 - 0.5 * i;
            if (i % 100000 === 0)
                gateway.notifyProgress(i / untilForFloat);
        }
        return sum;
    }
}
SumProcessor.listen();
FloatSumProcessor.listen();
