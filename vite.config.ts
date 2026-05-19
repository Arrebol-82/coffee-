import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-vue": ["vue", "vue-router", "pinia", "pinia-plugin-persistedstate"],
          "vendor-element-plus": ["element-plus", "@element-plus/icons-vue"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-msw": ["msw"],
        },
      },
    },
  },
});
