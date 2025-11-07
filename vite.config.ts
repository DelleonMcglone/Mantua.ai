import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(async ({ command, mode }) => {
  return {
    plugins: [
      react(),
      // Dynamically include cartographer plugin when serving
      ...(command === 'serve'
        ? [
            (await import('@replit/vite-plugin-cartographer')).cartographer(),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'client', 'src'),
        '@shared': path.resolve(import.meta.dirname, 'shared'),
        '@assets': path.resolve(import.meta.dirname, 'attached_assets'),
      },
    },
    root: path.resolve(import.meta.dirname, 'client'),
    build: {
      outDir: path.resolve(import.meta.dirname, 'dist/public'),
      emptyOutDir: true,
    },
    server: {
      hmr: {
        protocol: 'wss',
        clientPort: 443,
        overlay: false,
      },
      fs: {
        strict: true,
        allow: ['**/.*'],
      },
    },
  }
});