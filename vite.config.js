import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // When running `vite` alone (no netlify dev), API calls fail gracefully
      // and the app falls back to demo mode. Run `netlify dev` instead to
      // exercise the real functions + Blobs storage locally.
    },
  },
  build: {
    outDir: 'dist',
  },
});
