import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { prepareData } from './scripts/prepare-data.ts';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-geography-data',
      buildStart() {
        prepareData();
      },
    },
  ],
});
