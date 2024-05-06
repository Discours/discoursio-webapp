import ssrPlugin from 'vike/plugin'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import sassDts from 'vite-plugin-sass-dts'
import solidPlugin from 'vite-plugin-solid'

const cssModuleHMR = () => {
  return {
    enforce: 'post',
    name: 'css-module-hmr',
    apply: 'serve',
    handleHotUpdate(context) {
      const { modules } = context

      modules.forEach((module) => {
        if (module.id.includes('.module.scss')) {
          module.isSelfAccepting = true
        }
      })
    },
  }
}

const PATH_PREFIX = '/src/'

const getDevCssClassPrefix = (filename: string): string => {
  return filename
    .slice(filename.indexOf(PATH_PREFIX) + PATH_PREFIX.length)
    .replace('.module.scss', '')
    .replace(/[/?\\]/g, '-')
}

const devGenerateScopedName = (name: string, filename: string, _css: string) =>
  `${getDevCssClassPrefix(filename)}__${name}`

export default defineConfig(({ mode, command }) => {
  const plugins = [
    splitVendorChunkPlugin(),
    solidPlugin({ ssr: true }),
    ssrPlugin({ includeAssetsImportedByServer: true }),
    sassDts(),
    cssModuleHMR(),
    nodePolyfills({
      include: ['path', 'stream', 'util'],
      exclude: ['http'],
      globals: {
        Buffer: true,
        //global: true,
        //process: true,
      },
      overrides: {
        fs: 'memfs',
      },
      protocolImports: true,
    }),
  ]

  if (command === 'serve') {
    plugins.push(mkcert())
  }

  const isDev = mode === 'development'

  return {
    envPrefix: 'PUBLIC_',
    plugins,
    server: {
      cors: isDev,
      https: {},
      port: 3000,
    },
    sourcemap: isDev,
    css: {
      devSourcemap: isDev,
      preprocessorOptions: {
        scss: { additionalData: '@import "src/styles/imports";\n' },
      },
      modules: {
        generateScopedName: isDev ? devGenerateScopedName : '[hash:base64:5]',
      },
    },
    build: {
      rollupOptions: {
        external: [],
      },
      chunkSizeWarningLimit: 1024,
      target: 'esnext',
    },
    ssr: {
      noExternal: [
        'solid-js',
        '@nanostores/solid',
        '@urql/core',
        'wonka',
        'solid-popper',
        'seroval',
        'seroval-plugins',
        'seroval-plugins/web',
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
        'clsx',
      ],
    },
  }
})
