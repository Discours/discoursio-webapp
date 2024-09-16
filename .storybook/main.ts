import type { FrameworkOptions, StorybookConfig } from 'storybook-solidjs-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    {
      name: 'storybook-addon-sass-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: require('postcss')
        }
      }
    }
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
  viteFinal: (config) => {
    if (config.build) {
      config.build.sourcemap = true
      config.build.minify = process.env.NODE_ENV === 'production'
    }
    return config
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
