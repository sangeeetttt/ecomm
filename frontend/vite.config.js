import react from "@vitejs/plugin-react";
import mkcert from 'vite-plugin-mkcert';
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    mkcert({
      localhost: true, // Generate certificate for localhost
    }),
  ],
  server: {
    https: true,
    proxy: {
      '/api/': {
        target: 'https://localhost:5000/',
        changeOrigin: true,
        secure: false
      },
      // "/api/": "https://localhost:5000",
      "/uploads/": {target: 'https://localhost:5000/',
      changeOrigin: true,
      secure: false},
    },
  },
});
