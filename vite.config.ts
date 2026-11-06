import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/STAFF-Web-Portal/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});