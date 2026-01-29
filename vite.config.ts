
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Only expose the specific API_KEY to the client-side code
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
});
