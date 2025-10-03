/// <reference types="vite/client" />

type int = number;

type Offset = number;

type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never;