// biome-ignore lint/correctness/noNodejsModules: used during build
import path from 'node:path'
// import { visualizer } from 'rollup-plugin-visualizer'
import dotenv from 'dotenv'
import { CSSOptions } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import { PolyfillOptions, nodePolyfills } from 'vite-plugin-node-polyfills'
import sassDts from 'vite-plugin-sass-dts'

// Load environment variables from .env file
dotenv.config()

export const isDev = process.env.NODE_ENV !== 'production'
console.log(`[vite.config] ${process.env.NODE_ENV} mode`)

const polyfillOptions = {
  include: ['path', 'stream', 'util'],
  exclude: ['http'],
  globals: { Buffer: true },
  overrides: { fs: 'memfs' },
  protocolImports: true
} as PolyfillOptions

export default {
  resolve: {
    alias: {
      '~': path.resolve('./src'),
      '@': path.resolve('./public'),
      '/icons': path.resolve('./public/icons'),
      '/fonts': path.resolve('./public/fonts')
      // bootstrap: path.resolve('./node_modules/bootstrap')
    }
  },
  envPrefix: 'PUBLIC_',
  plugins: [isDev && mkcert(), nodePolyfills(polyfillOptions), sassDts()],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['mixed-decls'],
        additionalData: '@import "~/styles/inject";\n',
        includePaths: ['./public', './src/styles', './node_modules']
      }
    } as CSSOptions['preprocessorOptions']
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    minify: 'terser', // explicit terser usage
    terserOptions: {
      compress: {
        drop_console: true // removes console logs in production
      }
    },
    rollupOptions: {
      // plugins: [visualizer()]
      output: {
        manualChunks: {
          icons: ['./src/components/_shared/Icon/Icon.tsx'],
          session: ['./src/context/session.tsx'],
          localize: ['./src/context/localize.tsx'],
          editor: ['./src/context/editor.tsx'],
          connect: ['./src/context/connect.tsx']
        }
      }
    }
  }
}
