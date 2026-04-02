import {Process} from "./Process";

export class ProcessExecutable {
    private readonly process: Process;
    private readonly name: string;
    private readonly forwardedArgs: any[];

    constructor(name: string, process: Process, forwardedArgs: any[]) {
        this.name = name;
        this.process = process;
        this.forwardedArgs = forwardedArgs;
    }

    getProcess(): Process {
        return this.process;
    }

    getForwardedArgs(): any[] {
        return this.forwardedArgs;
    }

    getName(): string {
        return this.name;
    }
}