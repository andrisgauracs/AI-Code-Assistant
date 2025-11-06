import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: "esnext",
    minify: "terser",
    outDir: "dist",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
});
