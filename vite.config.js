import vue from "@vitejs/plugin-vue";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import { fileURLToPath, URL } from "node:url";
import { dirname } from "node:path";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";
import viteCompression from "vite-plugin-compression";
const options = { algorithm: "brotliCompress" };
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/** @type {import('vite').UserConfig} */
export default defineConfig({
  server: { port: 4000 },
  root: "./",
  define: {
    "process.env": {},
  },
  publicDir: "assets",
  /* esbuild: {
    drop: ["console"],
  }, */
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "public/**",
          dest: "./",
        },
        {
          src: "./src/firebase-messaging-sw.js",
          dest: "./",
        },
      ],
    }),
    vue(),
    VitePWA({
      root: dirname(__dirname),
      mode: "production",
      srcDir: "src",
      filename: "sw.ts",
      minify: true,
      strategies: "injectManifest",
      includeAssets: [
        "favicon.svg",
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
        "android-chrome-192x192.png",
        "android-chrome-512x512.png",
      ],
      manifest: {
        name: "Lucidify - Dream Journal & Reality Check",
        short_name: "Lucidify",
        description:
          "Track your dreams and perform reality checks to achieve lucid dreaming",
        start_url: "./index.html",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#4DBA87",
        gcm_sender_id: "1023426981171",
        permissions: ["notifications", "background"],
        categories: ["lifestyle", "productivity", "health"],
        icons: [
          {
            src: "./android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "./android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        screenshots: [
          {
            src: "./android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "wide",
          },
        ],
        shortcuts: [
          {
            name: "Reality Check",
            short_name: "Check",
            description: "Perform a reality check",
            url: "/reality-check",
            icons: [{ src: "./android-chrome-192x192.png", sizes: "192x192" }],
          },
          {
            name: "Record Dream",
            short_name: "Dream",
            description: "Record a new dream",
            url: "/dream-journal?new=1",
            icons: [{ src: "./android-chrome-192x192.png", sizes: "192x192" }],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/www\.gstatic\.com\/firebasejs\/.*/,
            handler: "CacheFirst",
            options: {
              cacheName: "firebase-js-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/fcm\.googleapis\.com\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "fcm-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
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
            "./src/layout/Auth",
            "./src/views/auth/login/Login",
            "./src/views/auth/register/Register",
          ],
          settings: ["./src/views/settings/Settings"],
          about: ["./src/views/About"],
          dreamJournal: ["./src/views/dream-journal/DreamJournal"],
          realityCheck: ["./src/views/RealityCheck"],
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
});
