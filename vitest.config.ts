import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    // legacy/ tiene el proyecto .NET + CRA viejo: no se testea ni se compila.
    exclude: ['node_modules/**', 'legacy/**', '.next/**', '.next-build/**'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // `server-only` solo existe para que Next falle el build si un modulo de
      // servidor se importa desde el cliente. En los tests no aplica.
      'server-only': fileURLToPath(new URL('./test/stub-server-only.ts', import.meta.url)),
    },
  },
});
