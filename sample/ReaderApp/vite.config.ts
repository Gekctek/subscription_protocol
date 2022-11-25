import { defineConfig, loadEnv } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import suidPlugin from "@suid/vite-plugin";

export default defineConfig(({ mode }) => {
  return {
    plugins: [suidPlugin(), solidPlugin()],
    server: {
      port: 3000,
    },
    build: {
      target: 'esnext',
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: "globalThis"
        },
        plugins: []
      },
    },
  }
});
