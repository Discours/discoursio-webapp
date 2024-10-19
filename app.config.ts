// biome-ignore lint/correctness/noNodejsModules: build
import { execSync } from 'node:child_process'
// biome-ignore lint/correctness/noNodejsModules: build
import fs from 'node:fs'
// biome-ignore lint/correctness/noNodejsModules: build
import path from 'node:path'
// biome-ignore lint/correctness/noNodejsModules: build
import { fileURLToPath } from 'node:url'
import { SolidStartInlineConfig, defineConfig } from '@solidjs/start/config'
import viteConfig, { isDev } from './vite.config'

const isVercel = Boolean(process.env.VERCEL)
const isNetlify = Boolean(process.env.NETLIFY)
const isBun = Boolean(process.env.BUN)

const preset = isNetlify ? 'netlify' : isVercel ? 'vercel_edge' : isBun ? 'bun' : 'node'
console.info(`[app.config] solid-start preset {> ${preset} <}`)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const keyPath = path.join(__dirname, 'key.pem')
const certPath = path.join(__dirname, 'cert.pem')

if (!fs.existsSync(keyPath)) {
  console.log('Calling mkcert...')
  execSync(`mkcert -key-file ${keyPath} -cert-file ${certPath} localhost 127.0.0.1 ::1`)
}

export default defineConfig({
  nitro: {
    timing: true
  },
  ssr: true,
  server: {
    preset,
    port: 3000,
    https: {
      key: fs.readFileSync(keyPath).toString(),
      cert: fs.readFileSync(certPath).toString()
    }
  },
  devOverlay: isDev,
  vite: viteConfig
} as SolidStartInlineConfig)
