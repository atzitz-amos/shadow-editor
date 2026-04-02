import {Process} from "../../src/core/threaded/process/Process";
import {ProcessGateway} from "../../src/core/threaded/process/ProcessGateway";

export class SumProcessor extends Process {
    getLaunchURL(): string {
        return import.meta.url;
    }

    async run(gateway: ProcessGateway, until: number, a: string): Promise<number> {
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
    getLaunchURL(): string {
        return import.meta.url;
    }

    async run(gateway: ProcessGateway, untilForFloat: number): Promise<number> {
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
