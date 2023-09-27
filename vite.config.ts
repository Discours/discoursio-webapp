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
        'js-cookie',
        '@solid-primitives/memo',
        '@solid-primitives/media',
        '@solid-primitives/storage',
        '@solid-primitives/utils',
        '@solid-primitives/rootless',
        'solid-tiptap',
        '@tiptap/extension-document',
        '@tiptap/core',
        '@tiptap/pm',
        'prosemirror-state',
        'prosemirror-model',
        'prosemirror-transform',
        'prosemirror-commands',
        'prosemirror-schema-list',
        '@tiptap/extension-text',
        '@tiptap/extension-paragraph',
        '@tiptap/extension-bold',
        '@tiptap/extension-italic'
      ]
    }
  }
})
