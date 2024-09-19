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
      options: ['primary', 'secondary', 'bordered', 'inline', 'light', 'outline', 'danger'],
      control: { type: 'select' }
    },
    size: {
      options: ['S', 'M', 'L'],
      control: { type: 'radio' }
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    isSubscribeButton: { control: 'boolean' },
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
    loading: false,
    disabled: false,
    isSubscribeButton: false
  }
}

export const Secondary: Story = {
  args: {
    value: 'Button',
    variant: 'secondary',
    size: 'M'
  }
}

export const Bordered: Story = {
  args: {
    value: 'Button',
    variant: 'bordered',
    size: 'M'
  }
}

export const Inline: Story = {
  args: {
    value: 'Button',
    variant: 'inline',
    size: 'M'
  }
}

export const Light: Story = {
  args: {
    value: 'Button',
    variant: 'light',
    size: 'M'
  }
}

export const Outline: Story = {
  args: {
    value: 'Button',
    variant: 'outline',
    size: 'M'
  }
}

export const Danger: Story = {
  args: {
    value: 'Button',
    variant: 'danger',
    size: 'M'
  }
}
