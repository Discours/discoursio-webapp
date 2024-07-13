import { SolidStartInlineConfig, defineConfig } from '@solidjs/start/config'
import { CSSOptions } from 'vite'
// import { visualizer } from 'rollup-plugin-visualizer'
import mkcert from 'vite-plugin-mkcert'
import { PolyfillOptions, nodePolyfills } from 'vite-plugin-node-polyfills'
import sassDts from 'vite-plugin-sass-dts'

const isVercel = Boolean(process?.env.VERCEL)
const isBun = Boolean(process.env.BUN)

const polyfillOptions = {
  include: ['path', 'stream', 'util'],
  exclude: ['http'],
  globals: {
    Buffer: true
  },
  overrides: {
    fs: 'memfs'
  },
  protocolImports: true
} as PolyfillOptions

export default defineConfig({
  ssr: true,
  server: {
    preset: isVercel ? 'vercel_edge' : isBun ? 'bun' : 'node',
    port: 3000,
    https: isBun
  },
  devOverlay: true,
  build: {
    chunkSizeWarningLimit: 1024,
    target: 'esnext'
  },
  vite: {
    envPrefix: 'PUBLIC_',
    plugins: [
      !isVercel && mkcert(),
      nodePolyfills(polyfillOptions),
      sassDts()
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "src/styles/imports";\n',
          includePaths: ['./public', './src/styles']
        }
      } as CSSOptions["preprocessorOptions"]
    }
  }
} as SolidStartInlineConfig)
