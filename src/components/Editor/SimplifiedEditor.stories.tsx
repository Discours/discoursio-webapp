import { Meta, StoryObj } from 'storybook-solidjs'
import SimplifiedEditor from './SimplifiedEditor'

const meta: Meta<typeof SimplifiedEditor> = {
  title: 'Components/SimplifiedEditor',
  component: SimplifiedEditor,
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text when the editor is empty',
      defaultValue: 'Type something...'
    },
    initialContent: {
      control: 'text',
      description: 'Initial content for the editor',
      defaultValue: ''
    },
    maxLength: {
      control: 'number',
      description: 'Character limit for the editor',
      defaultValue: 400
    },
    quoteEnabled: {
      control: 'boolean',
      description: 'Whether the blockquote feature is enabled',
      defaultValue: true
    },
    imageEnabled: {
      control: 'boolean',
      description: 'Whether the image feature is enabled',
      defaultValue: true
    },
    submitButtonText: {
      control: 'text',
      description: 'Text for the submit button',
      defaultValue: 'Submit'
    },
    onSubmit: {
      action: 'submitted',
      description: 'Callback when the form is submitted'
    },
    onCancel: {
      action: 'cancelled',
      description: 'Callback when the editor is cleared'
    },
    onChange: {
      action: 'changed',
      description: 'Callback when the content changes'
    }
  }
}

export default meta

type Story = StoryObj<typeof SimplifiedEditor>

export const Default: Story = {
  args: {
    placeholder: 'Type something...',
    initialContent: '',
    maxLength: 400,
    quoteEnabled: true,
    imageEnabled: true,
    submitButtonText: 'Submit'
  }
}

export const WithInitialContent: Story = {
  args: {
    placeholder: 'Type something...',
    initialContent: 'This is some initial content',
    maxLength: 400,
    quoteEnabled: true,
    imageEnabled: true,
    submitButtonText: 'Submit'
  }
}

export const WithCharacterLimit: Story = {
  args: {
    placeholder: 'You have a 50 character limit...',
    initialContent: '',
    maxLength: 50,
    quoteEnabled: true,
    imageEnabled: true,
    submitButtonText: 'Submit'
  }
}

export const WithCustomPlaceholder: Story = {
  args: {
    placeholder: 'Custom placeholder here...',
    initialContent: '',
    maxLength: 400,
    quoteEnabled: true,
    imageEnabled: true,
    submitButtonText: 'Submit'
  }
}
