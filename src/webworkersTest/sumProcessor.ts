import {Process} from "../editor/core/process/Process";
import {ProcessGateway} from "../editor/core/process/ProcessGateway";

export class SumProcessor extends Process {
    getLaunchURL(): string {
        return import.meta.url;
    }

    async run(gateway: ProcessGateway, until: number): Promise<number> {
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

    async run(gateway: ProcessGateway, until: number): Promise<number> {
        let sum = 0;
        for (let i = 0; i < until; i++) {
            sum += i * 1.5 - 0.5 * i;
            if (i % 100000 === 0)
                gateway.notifyProgress(i / until);
        }
        return sum;
    }
}


SumProcessor.listen();
FloatSumProcessor.listen();
