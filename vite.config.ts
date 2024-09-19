// biome-ignore lint/correctness/noNodejsModules: used during build
import path from 'node:path'
import { CSSOptions } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import { PolyfillOptions, nodePolyfills } from 'vite-plugin-node-polyfills'
import sassDts from 'vite-plugin-sass-dts'
// import { visualizer } from 'rollup-plugin-visualizer'

const isDev = process.env.NODE_ENV !== 'production'
console.log(`[vite.config] development mode: ${isDev}`)

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

export default {
  resolve: {
    alias: {
      '~': path.resolve('./src'),
      '@': path.resolve('./public'),
      '/icons': path.resolve('./public/icons'),
      '/fonts': path.resolve('./public/fonts'),
      bootstrap: path.resolve('./node_modules/bootstrap')
    }
  },
  envPrefix: 'PUBLIC_',
  plugins: [isDev && mkcert(), nodePolyfills(polyfillOptions), sassDts()],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['mixed-decls'],
        additionalData: '@import "~/styles/imports";\n',
        includePaths: ['./public', './src/styles', './node_modules']
      }
    } as CSSOptions['preprocessorOptions']
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      // plugins: [visualizer()]
      output: {
        manualChunks: {
          icons: ['./src/components/_shared/Icon/Icon.tsx'],
          session: ['./src/context/session.tsx'],
          editor: ['./src/context/editor.tsx'],
          connect: ['./src/context/connect.tsx']
        }
      }
    }
  }
}
