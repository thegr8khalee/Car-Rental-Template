import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@branding-config': resolve(__dirname, '..', 'branding.config.json'),
    },
  },
  server: {
    fs: {
      allow: [resolve(__dirname, '..')],
    },
    host: true, // allow external access (important for ngrok)
    origin: 'https://43160d029324.ngrok-free.app', // set correct origin
    cors: {
      origin: 'https://43160d029324.ngrok-free.app',
      credentials: true,
    },
  },
});
