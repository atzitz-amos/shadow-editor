// vite.config.ts
import {defineConfig} from "vite";

export default defineConfig({
    root: ".", // your project root
    esbuild: {
        target: "es2022",
        supported: {
            decorators: false
        }
    },
    optimizeDeps: {
        esbuildOptions: {
            target: "es2022",
            supported: {
                decorators: false
            }
        }
    },
    build: {
        target: "es2022"
    }
});