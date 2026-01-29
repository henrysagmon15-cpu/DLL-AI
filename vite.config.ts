import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Vite does not automatically expose environment variables to the client.
    // This 'define' replaces occurrences of process.env.API_KEY with the value
    // provided during the Vercel build process.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});