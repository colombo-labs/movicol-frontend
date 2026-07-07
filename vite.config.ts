import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@modules': resolve(__dirname, 'src/modules'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/nominatim': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nominatim/, ''),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/modules/chat/**',
        'src/modules/planificar/api/**',
        'src/modules/planificar/hooks/**',
        'src/modules/planificar/models/**',
        'src/modules/predicciones/hooks/**',
        'src/modules/mapa/hooks/**',
        'src/shared/utils/**',
        'src/shared/hooks/useWeather.ts',
        'src/shared/hooks/useTheme.ts',
        'src/shared/ui/AuthButton.tsx',
        'src/shared/ui/ConfigModal.tsx',
        'src/shared/ui/NotificationsModal.tsx',
        'src/shared/ui/Skeleton.tsx',
      ],
      exclude: [
        '**/*.test.*',
        '**/*.spec.*',
        '**/index.ts',
      ],
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 60,
        lines: 60,
      },
    },
  },
});
