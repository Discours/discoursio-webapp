import { SolidStartInlineConfig, defineConfig } from '@solidjs/start/config'
import viteConfig from './vite.config'

const isVercel = Boolean(process?.env.VERCEL)
const isNetlify = Boolean(process?.env.NETLIFY)
const isBun = Boolean(process.env.BUN)

export const runtime = isNetlify ? 'netlify' : isVercel ? 'vercel_edge' : isBun ? 'bun' : 'node'
console.info(`[app.config] solid-start build for ${runtime}!`)

export default defineConfig({
  nitro: {
    timing: true
  },
  ssr: true,
  server: {
    preset: runtime,
    port: 3000,
    https: true
  },
  devOverlay: true,
  vite: viteConfig
} as SolidStartInlineConfig)
