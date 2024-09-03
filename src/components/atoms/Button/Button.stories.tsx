// src/components/atoms/Button/Button.stories.tsx
import type { Meta } from '@storybook/html'
import { Button } from './Button'

// Примените корректную типизацию для Storybook
const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  argTypes: {
    label: { control: 'text' },
    primary: { control: 'boolean' },
    onClick: { action: 'clicked' }
  }
}

export default meta
