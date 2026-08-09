import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";

export default defineConfig({
  plugins: [TanStackRouterVite(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
  define: {
    "process.env": {},
    global: "globalThis",
  },
});
