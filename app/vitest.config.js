import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ['test/**/*.js'],
    environment: 'node'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './')
    }
  }
}); 