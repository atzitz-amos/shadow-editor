export enum ProcessGatewayMessage {
    // Messages from worker to main thread
    FAIL_IMMEDIATELY = "fail-immediately",
    NOTIFY_ERROR = "notify-error",
    NOTIFY_PROGRESS = "notify-progress",
    NOTIFY_RESULT = "notify-result",
    NOTIFY_COMPLETE = "notify-complete",

    // Messages from main thread to worker
    LAUNCH = "launch"
}

export type ProcessGatewayWorkerCommand = ProcessGatewayMessage.FAIL_IMMEDIATELY
    | ProcessGatewayMessage.NOTIFY_ERROR
    | ProcessGatewayMessage.NOTIFY_PROGRESS
    | ProcessGatewayMessage.NOTIFY_RESULT
    | ProcessGatewayMessage.NOTIFY_COMPLETE;

export type ProcessGatewayMainCommand = ProcessGatewayMessage.LAUNCH;

export type ProcessGatewayMessageData = {
    "fail-immediately": { error: string };
    "notify-error": { error: string };
    "notify-progress": { progress: number };
    "notify-result": { result: any };
    "notify-complete": { result: any };
    "launch": { process: string, args: any[] };
}