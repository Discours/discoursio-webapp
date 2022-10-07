import { defineConfig, AstroUserConfig } from 'astro/config'
import vercel from '@astrojs/vercel/serverless'
// import node from '@astrojs/node'
import solidJs from '@astrojs/solid-js'
import mdx from '@astrojs/mdx'
// import partytown from '@astrojs/partytown'
import { markdownOptions as markdown } from './mdx.config'
// import sitemap from '@astrojs/sitemap'
import type { CSSOptions } from 'vite'
import defaultGenerateScopedName from 'postcss-modules/build/generateScopedName'
import { isDev } from './src/utils/config'
import { visualizer } from 'rollup-plugin-visualizer'

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
  integrations: [solidJs(), mdx()],
  //, partytown({})],
  markdown,
  output: 'server',
  adapter: vercel(),
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              let chunkid = 'vendor'
              if (id.includes('prosemirror')) {
                chunkid = 'prosemirror'
              }
              if (id.includes('markdown')) {
                chunkid = 'markdown'
              }
              if (id.includes('remark') || id.includes('rehype')) {
                chunkid = 'remark'
              }
              if (id.includes('yjs') || id.includes('y-')) {
                chunkid = 'yjs'
              }
              if (id.includes('loglevel')) {
                chunkid = 'loglevel'
              }
              if (id.includes('nanostores')) {
                chunkid = 'nanostores'
              }
              return chunkid
            }
          }
        },
        external: ['@aws-sdk/clients/s3']
      }
    },
    css
  }
}

// https://astro.build/config
export default defineConfig(astroConfig)
