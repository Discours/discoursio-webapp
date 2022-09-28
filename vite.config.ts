import { defineConfig, UserConfigExport } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import ssrPlugin from 'vite-plugin-ssr/plugin'
import defaultGenerateScopedName from 'postcss-modules/build/generateScopedName'

const PATH_PREFIX = '/src/'

const getDevCssClassPrefix = (filename: string): string => {
  return filename
    .slice(filename.indexOf(PATH_PREFIX) + PATH_PREFIX.length)
    .replace('.module.scss', '')
    .replace(/[/?\\]/, '-')
    .replace('?', '-')
}

const devGenerateScopedName = (name: string, filename: string, css: string) =>
  getDevCssClassPrefix(filename) + '_' + defaultGenerateScopedName(name, filename, css)

export default defineConfig(({ mode, command, ssrBuild }) => {
  const isDev = mode === 'development'

  return {
    plugins: [solidPlugin({ ssr: true }), ssrPlugin({ includeAssetsImportedByServer: true })],
    server: {
      port: 3000,
      strictPort: true
    },
    css: {
      preprocessorOptions: {
        scss: { additionalData: '@import "src/styles/imports";\n' }
      },
      modules: {
        generateScopedName: isDev ? devGenerateScopedName : defaultGenerateScopedName,
        localsConvention: null
      }
    },
    build: {
      target: 'esnext'
      // FIXME ??
      // polyfillDynamicImport: false
    }
  }
})
