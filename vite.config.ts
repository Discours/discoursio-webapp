import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import ssrPlugin from 'vite-plugin-ssr/plugin'
import sassDts from 'vite-plugin-sass-dts'

const PATH_PREFIX = '/src/'

const getDevCssClassPrefix = (filename: string): string => {
  return filename
    .slice(filename.indexOf(PATH_PREFIX) + PATH_PREFIX.length)
    .replace('.module.scss', '')
    .replaceAll(/[/?\\]/g, '-')
}

const devGenerateScopedName = (name: string, filename: string, _css: string) =>
  getDevCssClassPrefix(filename) + '__' + name

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    envPrefix: 'PUBLIC_',
    plugins: [solidPlugin({ ssr: true }), ssrPlugin({ includeAssetsImportedByServer: true }), sassDts()],
    server: {
      port: 3000
    },
    css: {
      preprocessorOptions: {
        scss: { additionalData: '@import "src/styles/imports";\n' }
      },
      modules: {
        generateScopedName: isDev ? devGenerateScopedName : undefined
      }
    },
    build: {
      rollupOptions: {
        external: []
      },
      chunkSizeWarningLimit: 1024,
      target: 'esnext'
    }
  }
})
