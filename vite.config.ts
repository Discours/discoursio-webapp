// biome-ignore lint/correctness/noNodejsModules: build
import path from 'node:path'
import dotenv from 'dotenv'
import { CSSOptions, LogLevel, LoggerOptions, createLogger, defineConfig } from 'vite'

// Load environment variables from .env file
dotenv.config()

export const isDev = process.env.NODE_ENV !== 'production'
console.log(`[vite.config] ${process.env.NODE_ENV} mode`)

const customLogger = createLogger(
  'debug' as LogLevel,
  {
    warn: (message: string, options: LoggerOptions) => {
      if (!message.startsWith('Future global-builtin')) {
        console.warn(message, options)
      }
    }
  } as LoggerOptions
)

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve('./src'),
      '@': path.resolve('./public'),
      '/icons': path.resolve('./public/icons'),
      '/fonts': path.resolve('./public/fonts')
    }
  },
  envPrefix: 'PUBLIC_',
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        quietDeps: true,
        silenceDeprecations: ['mixed-decls', 'legacy-js-api', 'global-builtin'],
        additionalData: (content: string) => `@use '~/styles/global' as *;\n${content}`,
        includePaths: ['./public', './src/styles', './node_modules']
      }
    } as CSSOptions['preprocessorOptions']
  },
  customLogger,
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
      output: {
        manualChunks: {
          icons: ['./src/components/_shared/Icon/Icon.tsx'],
          session: ['./src/context/session.tsx'],
          localize: ['./src/context/localize.tsx'],
          editor: ['./src/context/editor.tsx'],
          connect: ['./src/context/connect.tsx']
        }
      }
    },
    commonjsOptions: {
      ignore: ['punycode']
    }
  },
  optimizeDeps: {
    include: ['solid-tiptap'],
    exclude: ['punycode']
  }
})
