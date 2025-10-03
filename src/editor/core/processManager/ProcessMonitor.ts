import {ProcessExecutable} from "./ProcessExecutable";
import {ProcessGatewayMessage} from "./ProcessGatewayMessage";

export enum ProcessState {
    RUNNING,
    COMPLETED,
    CANCELLED,
    FAILED
}

export class ProcessMonitor {
    launchedAt: number;
    completedAt: number;

    state: ProcessState;

    private progressListeners: ((progress: number) => void)[] = [];
    private successListeners: ((result: any) => void)[] = [];

    constructor(private executable: ProcessExecutable, private worker: Worker) {
    }

    initialize(worker: Worker) {
        worker.onmessage = this.onMessage.bind(this);

        this.state = ProcessState.RUNNING;
        this.launchedAt = Date.now();
    }

    public addProgressListener(listener: (progress: number) => void) {
        this.progressListeners.push(listener);
    }

    public whenComplete(listener: (result: any) => void) {
        this.successListeners.push(listener);
    }

    public getCompletionTime() {
        if (!this.completedAt) return 0;
        return this.completedAt - this.launchedAt;
    }

    public getProcessName() {
        return this.executable.getName();
    }

    public timeoutAfter(ms: number) {
        setTimeout(() => {
            if (this.state === ProcessState.RUNNING) {
                this.worker.terminate();
                this.state = ProcessState.CANCELLED;
                console.warn(`Process ${this.getProcessName()} timed out after ${ms}ms`);
            }
        }, ms);
    }

    public cancel() {
        if (this.state === ProcessState.RUNNING) {
            this.worker.terminate();
            this.state = ProcessState.CANCELLED;
            console.warn(`Process ${this.getProcessName()} was cancelled`);
        }
    }

    private onMessage(event: MessageEvent) {
        // Handle messages from the worker process
        const data = event.data;


        if (data.cmd === ProcessGatewayMessage.NOTIFY_COMPLETE) {
            this.completedAt = Date.now();
            this.state = ProcessState.COMPLETED;
            this.successListeners.forEach(listener => listener(data.result));
        } else if (data.cmd === ProcessGatewayMessage.NOTIFY_PROGRESS) {
            this.progressListeners.forEach(listener => listener(data.progress));
        }

    }
}