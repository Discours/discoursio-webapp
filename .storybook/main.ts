import type { FrameworkOptions, StorybookConfig } from 'storybook-solidjs-vite'
import { mergeConfig } from 'vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    'storybook-addon-sass-postcss',
    'storybook-addon-vite-mock'
  ],
  framework: {
    name: 'storybook-solidjs-vite',
    options: {
      builder: {
        viteConfigPath: './vite.config.ts'
      }
    } as FrameworkOptions
  },
  docs: {
    autodocs: 'tag'
  },
  previewHead: (head) => `
    ${head}
    <style>
      body {
        transition: none !important;
      }
    </style>
  `,
  viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          buffer: 'buffer'
        }
      },
      define: {
        'process.env': {},
        global: 'globalThis'
      }
    })
  }
}
export default config
