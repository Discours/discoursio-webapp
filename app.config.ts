import { SolidStartInlineConfig, defineConfig } from '@solidjs/start/config'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import sassDts from 'vite-plugin-sass-dts'

const isVercel = Boolean(process?.env.VERCEL)
const isBun = Boolean(process.env.BUN)
export default defineConfig({
  ssr: true,
  server: {
    preset: isVercel ? 'vercel_edge' : isBun ? 'bun' : 'node',
    port: 3000,
  },
  devOverlay: true,
  build: {
    chunkSizeWarningLimit: 1024,
    target: 'esnext',
  },
  vite: {
    envPrefix: 'PUBLIC_',
    plugins: [
      nodePolyfills({
        include: ['path', 'stream', 'util'],
        exclude: ['http'],
        globals: {
          Buffer: true,
        },
        overrides: {
          fs: 'memfs',
        },
        protocolImports: true,
      }),
      sassDts()
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "src/styles/imports";\n',
          includePaths: ['./public', './src/styles'],
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1024,
      target: 'esnext',
    }
  }
} as SolidStartInlineConfig)
