/// <reference types="vite/client" />

type int = number;

type Offset = number;

type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never;

type AbstractConstructor<T> = abstract new (...args: any[]) => T;

type Constructor<T = any, A extends any[] = any[]> = new (...args: A) => T;

type Class<T> = AbstractConstructor<T> | Constructor<T>;
