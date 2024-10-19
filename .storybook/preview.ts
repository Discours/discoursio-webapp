import { withThemeByClassName } from '@storybook/addon-themes'

import '../src/styles/app.scss'

const preview = {
  parameters: {
    themes: {
      default: 'light',
      list: [
        { name: 'light', class: '', color: '#f8fafc' },
        { name: 'dark', class: 'dark', color: '#0f172a' }
      ]
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    }
  }
}

export default preview

export const decorators = [
  withThemeByClassName({
    themes: {
      light: '',
      dark: 'dark'
    },
    defaultTheme: 'light',
    parentSelector: 'body'
  })
]
