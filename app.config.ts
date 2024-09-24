import { SolidStartInlineConfig, defineConfig } from '@solidjs/start/config'
import viteConfig, { isDev } from './vite.config'

const isVercel = Boolean(process.env.VERCEL)
const isNetlify = Boolean(process.env.NETLIFY)
const isBun = Boolean(process.env.BUN)

const preset = isNetlify ? 'netlify' : isVercel ? 'vercel_edge' : isBun ? 'bun' : 'node'
console.info(`[app.config] solid-start preset {> ${preset} <}`)

export default defineConfig({
  nitro: {
    timing: true
  },
  ssr: true,
  server: {
    preset,
    port: 3000,
    https: true
  },
  devOverlay: isDev,
  vite: viteConfig
} as SolidStartInlineConfig)
