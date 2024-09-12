import { SolidStartInlineConfig, defineConfig } from '@solidjs/start/config'
import viteConfig, { runtime } from './vite.config'

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
