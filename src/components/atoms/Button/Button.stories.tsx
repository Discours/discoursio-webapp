// src/components/atoms/Button/Button.stories.tsx
// import type { Meta, StoryObj } from '@storybook/html'

import { Meta, StoryObj} from "storybook-solidjs";
import { Button } from './Button';
import './Button.module.scss';

// Примените корректную типизацию для Storybook
const meta: Meta <typeof Button> = {
  title: 'Atom/Button',
  component: Button,

  argTypes: {
    value: { control: 'text' },
    variant: {
      options: ['primary', 'secondary', 'bordered', 'inline', 'light', 'outline', 'danger'],
      control: {type: 'select'}
    },
    size: {
      options: ['S', 'M', 'L'],
      control: {type: 'radio'}
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    isSubscribeButton: { control: 'boolean' },
    onClick: { action: 'clicked' }
  }
}

export default meta;

type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    value: 'Button',
    variant: "primary",
    size: 'M',
    loading: false,
    disabled: false,
    isSubscribeButton: false
  }
}


