export type Migration<T = any> = (raw: any, fromVersion: number) => any;
