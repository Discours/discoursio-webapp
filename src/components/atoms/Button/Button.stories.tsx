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
        'primary-disabled',
        'secondary',
        'secondary-disabled',
        'bordered',
        'outline',
        'primary-square',
        'secondary-square',
        'disabled'
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

export const PrimaryDisabled: Story = {
  args: {
    value: 'Button',
    variant: 'primary-disabled',
    size: 'M'
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

export const SecondaryDisabled: Story = {
  args: {
    value: 'Button',
    variant: 'secondary-disabled',
    size: 'M'
  }
}

export const Subscribe: Story = {
  args: {
    value: 'State A',
    variant: 'bordered',
    size: 'M'
  }
}

export const PrimarySwitchFromStateBToStateA: Story = {
  args: {
    value: 'State B',
    variant: 'outline',
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

export const Disabled: Story = {
  args: {
    value: 'Button',
    variant: 'disabled',
    size: 'S-square'
  }
}
