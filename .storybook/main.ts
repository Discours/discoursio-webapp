import type { FrameworkOptions, StorybookConfig } from 'storybook-solidjs-vite'
import {CSSOptions} from "vite";

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-themes'
  ],
  framework: {
    name: 'storybook-solidjs-vite',
    options: {
      builder: {
        viteConfigPath: './app.config.ts'
      }
    } as FrameworkOptions
  },
  docs: {
    autodocs: 'tag'
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "src/styles/imports";\n',
        includePaths: ['./public', './src/styles']
      }
    } as CSSOptions['preprocessorOptions']
  },
  previewHead: (head) => `
    ${head}
    <style>
      body {
        transition: none !important;
      }
    </style>
  `
}
export default config
