import { SolidStartInlineConfig, defineConfig } from '@solidjs/start/config'
import { CSSOptions } from 'vite'
// import { visualizer } from 'rollup-plugin-visualizer'
import mkcert from 'vite-plugin-mkcert'
import { PolyfillOptions, nodePolyfills } from 'vite-plugin-node-polyfills'
import sassDts from 'vite-plugin-sass-dts'

const isVercel = Boolean(process?.env.VERCEL)
const isNetlify = Boolean(process?.env.NETLIFY)
const isBun = Boolean(process.env.BUN)
const runtime = isNetlify ? 'netlify' : isVercel ? 'vercel_edge' : isBun ? 'bun' : 'node'
console.info(`[app.config] build for ${runtime}!`)

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
  nitro: {
    timing: true
  },
  ssr: true,
  server: {
    preset: runtime,
    port: 3000,
    https: true
  },
  devOverlay: true,
  build: {
    chunkSizeWarningLimit: 1024,
    target: 'esnext',
    sourcemap: true
  },
  vite: {
    envPrefix: 'PUBLIC_',
    plugins: [!isVercel && mkcert(), nodePolyfills(polyfillOptions), sassDts()],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "src/styles/imports";\n',
          includePaths: ['./public', './src/styles']
        }
      } as CSSOptions['preprocessorOptions']
    }
  }
} as SolidStartInlineConfig)
