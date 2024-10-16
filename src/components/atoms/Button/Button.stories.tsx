// src/components/atoms/Button/Button.stories.tsx
// import type { Meta, StoryObj } from '@storybook/html'

import { Meta, StoryObj } from 'storybook-solidjs'
import { Button } from './Button'
import './Button.module.scss'

// Примените корректную типизацию для Storybook
const meta: Meta<typeof Button> = {
  title: 'Atom/Button',
  component: Button,
  argTypes: {
    value: {
      control: { type: 'text' }
    },
    variant: {
      options: [
        'primary',
        'secondary',
        'subscribeButton',
        'unsubscribeButton',
        'primary-square',
        'secondary-square'
      ],
      control: { type: 'select' }
    },
    size: {
      options: ['S', 'M', 'L', 'M-square', 'S-square', 'XS-square'],
      control: { type: 'select' }
    },
    disabled: {
      control: 'boolean'
    },
    loading: {
      control: 'boolean'
    },
    isSubscribeButton: {
      control: 'boolean'
    },
    onClick: { action: 'clicked' }
  }
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    value: 'Button',
    variant: 'primary',
    size: 'M',
    disabled: false,
    loading: false,
    isSubscribeButton: false
  }
}

export const Secondary: Story = {
  args: {
    value: 'Button',
    variant: 'secondary',
    size: 'M',
    disabled: false,
    loading: false
  }
}

export const Subscribe: Story = {
  args: {
    value: 'State A',
    variant: 'subscribeButton',
    size: 'M'
  }
}

export const Unsubscribe: Story = {
  args: {
    value: 'State B',
    variant: 'unsubscribeButton',
    size: 'M'
  }
}

export const PrimarySquare: Story = {
  args: {
    value: 'Button',
    variant: 'primary-square',
    size: 'S-square',
    disabled: false,
    loading: false,
    isSubscribeButton: false
  }
}

export const SecondarySquare: Story = {
  args: {
    value: 'Button',
    variant: 'secondary-square',
    size: 'S-square',
    disabled: false,
    loading: false
  }
}
