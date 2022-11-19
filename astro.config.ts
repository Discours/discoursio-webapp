import { defineConfig, AstroUserConfig } from 'astro/config'
import vercel from '@astrojs/vercel/serverless'
import solidJs from '@astrojs/solid-js'
import type { CSSOptions, PluginOption } from 'vite'
import defaultGenerateScopedName from 'postcss-modules/build/generateScopedName'
import { isDev } from './src/utils/config'
import { visualizer } from 'rollup-plugin-visualizer'
import htmlPurge from 'vite-plugin-html-purgecss'

const PATH_PREFIX = '/src/'

const getDevCssClassPrefix = (filename: string): string => {
  return filename
    .slice(filename.indexOf(PATH_PREFIX) + PATH_PREFIX.length)
    .replace('.module.scss', '')
    .replace(/[/?\\]/g, '-')
}

const devGenerateScopedName = (name: string, filename: string, css: string) =>
  getDevCssClassPrefix(filename) + '_' + defaultGenerateScopedName(name, filename, css)

const css: CSSOptions = {
  preprocessorOptions: {
    scss: {
      additionalData: '@import "src/styles/imports";\n'
    }
  },
  modules: {
    generateScopedName: isDev ? devGenerateScopedName : defaultGenerateScopedName,
    localsConvention: null
  }
}

const astroConfig: AstroUserConfig = {
  site: 'https://new.discours.io',
  integrations: [solidJs()],
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [htmlPurge() as PluginOption],
    build: {
      chunkSizeWarningLimit: 777,
      rollupOptions: {
        plugins: [visualizer()],
        output: {
          // eslint-disable-next-line sonarjs/cognitive-complexity
          /*
          manualChunks(id) {
            if (id.includes('p2p')) return 'p2p'
            if (id.includes('editor') || id.includes('Editor')) return 'editor'
            if (id.includes('node_modules')) {
              let chunkid
              if (id.includes('solid')) chunkid = 'solid'
              if (id.includes('swiper')) chunkid = 'swiper'
              if (id.includes('acorn')) chunkid = 'acorn'
              if (id.includes('prosemirror')) chunkid = 'editor'
              if (id.includes('markdown') || id.includes('mdurl') || id.includes('yjs')) {
                chunkid = 'codecs'
              }
              if (
                id.includes('p2p') ||
                id.includes('y-protocols') ||
                id.includes('y-webrtc') ||
                id.includes('simple-peer')
              ) {
                chunkid = 'p2p'
              }
              return chunkid
            }
          }
          */
        },
        external: []
      }
    },
    css
  }
}

// https://astro.build/config
export default defineConfig(astroConfig)
