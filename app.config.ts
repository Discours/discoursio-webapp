import { SolidStartInlineConfig, defineConfig } from '@solidjs/start/config'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import sassDts from 'vite-plugin-sass-dts'

const isVercel = Boolean(process?.env.VERCEL)

export default defineConfig({
  server: {
    preset: isVercel ? 'vercel_edge' : 'bun',
    port: 3000,
  },
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
          includePaths: ['public', 'src/styles']
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1024,
      target: 'esnext',
    }
  }
} as SolidStartInlineConfig)
