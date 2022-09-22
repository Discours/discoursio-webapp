import { defineConfig, AstroUserConfig } from 'astro/config'
import vercel from '@astrojs/vercel/serverless'
// import node from '@astrojs/node'
import solidJs from '@astrojs/solid-js'
import mdx from '@astrojs/mdx'
// import partytown from '@astrojs/partytown'
import { markdownOptions as markdown } from './mdx.config'
// import sitemap from '@astrojs/sitemap'
import type { CSSOptions } from 'vite'

// const dev = process.env.NODE_ENV != 'production'

const css: CSSOptions = {
  preprocessorOptions: {
    scss: {
      additionalData: '@import "src/styles/imports";\n'
    }
  }
}

const astroConfig: AstroUserConfig = {
  site: 'https://new.discours.io',
  // Enable Solid to support Solid JSX components.
  // experimental: { integrations: true },
  integrations: [solidJs(), mdx()],
  // sitemap({
  /*  customPages: [
      '',
      '/feed',
      '/search',
      'topics',
      'authors'
    ]
  })],*/
  //, partytown({})],
  markdown,
  output: 'server',
  adapter: vercel(),
  vite: {
    build: {
      chunkSizeWarningLimit: 777,
      rollupOptions: {
        external: ['@aws-sdk/clients/s3']
      }
    },
    resolve: {
      alias: {
        '@': './src'
      }
    },
    css
  }
}

// https://astro.build/config
export default defineConfig(astroConfig)
