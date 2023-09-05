import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import ssrPlugin from 'vite-plugin-ssr/plugin'
import sassDts from 'vite-plugin-sass-dts'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig(({ command }) => {
  const plugins = [
    solidPlugin({ ssr: true }),
    ssrPlugin({ includeAssetsImportedByServer: true }),
    sassDts()
  ]

  if (command === 'serve') {
    plugins.push(mkcert())
  }

  return {
    envPrefix: 'PUBLIC_',
    plugins,
    server: {
      https: true,
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
        '@tiptap/extension-italic',
        '@tiptap/extension-blockquote',
        '@solid-primitives/upload',
        '@tiptap/extension-placeholder',
        'prosemirror-view',
        '@tiptap/extension-link',
        '@tiptap/extension-image',
        '@tiptap/extension-character-count',
        'clsx'
      ]
    }
  }
})
