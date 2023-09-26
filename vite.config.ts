import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import ssrPlugin from 'vite-plugin-ssr/plugin'
import sassDts from 'vite-plugin-sass-dts'

export default defineConfig(() => {
  return {
    envPrefix: 'PUBLIC_',
    plugins: [solidPlugin({ ssr: true }), ssrPlugin({ includeAssetsImportedByServer: true }), sassDts()],
    server: {
      port: 3000
    },
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: { additionalData: '@import "src/styles/imports";\n' }
      }
    },
    build: {
      rollupOptions: {
        external: []
      },
      chunkSizeWarningLimit: 1024,
      target: 'esnext'
    },
    ssr: {
      noExternal: [
        'solid-js',
        '@nanostores/solid',
        '@urql/core',
        'wonka',
        'solid-popper',
        'seroval',
        '@solid-primitives/share',
        'i18next',
        'js-cookie'
      ]
    }
  }
})
