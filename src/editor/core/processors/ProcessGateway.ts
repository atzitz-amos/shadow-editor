import {Process} from "./Process";
import {ProcessLauncherUtils} from "./ProcessLauncherUtils";
import {ProcessGatewayMessage, ProcessGatewayMessageData, ProcessGatewayWorkerCommand} from "./ProcessGatewayMessage";
import {SerializationUtils} from "../serializable/SerializationUtils";

export class ProcessGateway {
    public initialize() {
        ProcessLauncherUtils.assertWorkerThread();

        self.addEventListener("message", this.onMessage.bind(this), true);
    }

    public initializeAndRun(instance: Process, args: any[]) {
        this.initialize();

        instance.run(this, ...args).then(result => this.forwardAndTerminate(result)).catch(error => this.onError(error));
    }

    public postMessage<T extends ProcessGatewayWorkerCommand>(message: T, data: ProcessGatewayMessageData[T]) {
        (data as any).cmd = message;
        self.postMessage(data);
    }

    public failImmediately(error: any) {
        this.postMessage(ProcessGatewayMessage.FAIL_IMMEDIATELY, {error: error.toString()});
    }

    public forward(result: any) {
        this.postMessage(ProcessGatewayMessage.NOTIFY_RESULT, {result: this.serialize(result)});
    }

    public forwardAndTerminate(result: any) {
        this.postMessage(ProcessGatewayMessage.NOTIFY_COMPLETE, {result: this.serialize(result)});
    }

    public notifyProgress(progress: number) {
        this.postMessage(ProcessGatewayMessage.NOTIFY_PROGRESS, {progress});
    }

    private onMessage(event: MessageEvent) {

    }

    private onError(error: any) {
        this.postMessage(ProcessGatewayMessage.NOTIFY_ERROR, {error})
    }

    private serialize(result: any) {
        return SerializationUtils.serializeAny(result);
    }
}