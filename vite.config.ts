import { defineConfig } from "vite";
import swc from "unplugin-swc";

export default defineConfig({
    root: ".",
    plugins: [
        swc.vite({
            jsc: {
                parser: {
                    syntax: "typescript",
                    decorators: true,
                },
                transform: {
                    decoratorVersion: "2022-03",
                },
                target: "es2022",
            },
        }),
    ],
    build: {
        target: "es2022"
    }
});