import vue from "@vitejs/plugin-vue";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import { fileURLToPath, URL } from "node:url";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
import viteCompression from "vite-plugin-compression";
const options = { algorithm: "brotliCompress" };
/** @type {import('vite').UserConfig} */
export default defineConfig({
  root: "./",
  define: {
    "process.env": {},
  },
  publicDir: "assets",
  plugins: [
    vue(),
    VitePWA({
      mode: "production",
      srcDir: "src",
      filename: "sw.ts",
      strategies: "injectManifest",
      includeAssets: [
        "favicon.svg",
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
      ],
      manifest: {
        name: "Vue 3 Template",
        short_name: "Vue 3",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
    splitVendorChunkPlugin(),
    viteCompression(options),
  ],
  resolve: {
    alias: {
      // vue: "@vue/compat",
      vue: "vue/dist/vue.esm-bundler.js",
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "~": fileURLToPath(new URL("./node_modules", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  optimizeDeps: {
    include: ["lodash"],
  },
  build: {
    outDir: "dist",
    target: "esnext",
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ["vue", "vue-router"],
          home: ["./src/views/home/Home"],
          dashboard: ["./src/layout/Layout", "./src/views/dashboard/Dashboard"],
          auth: [
            "./src/layout/Auth.vue",
            "./src/views/auth/login/Login",
            "./src/views/auth/register/Register",
          ],
          settings: ["./src/views/settings/Settings"],
          about: ["./src/views/About.vue"],
          profile: ["./src/views/Profile.vue"],
        },
        plugins: [
          visualizer({
            open: true,
            filename: "dist/stats.html",
          }),
        ],
      },
    },
  },
  esbuild: {
    drop: ["console"],
  },
});
