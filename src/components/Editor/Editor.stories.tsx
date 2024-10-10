import { Meta, StoryObj } from 'storybook-solidjs'
import { EditorComponent } from './Editor'

const meta: Meta<typeof EditorComponent> = {
  title: 'Editor/Editor',
  component: EditorComponent,
  argTypes: {
    content: {
      control: 'text',
      description: 'Initial content for the editor',
      defaultValue: ''
    },
    limit: {
      control: 'number',
      description: 'Character limit for the editor',
      defaultValue: 500
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when the editor is empty',
      defaultValue: 'Start typing here...'
    },
    onChange: {
      action: 'changed',
      description: 'Callback when the content changes'
    }
  }
}

export default meta

type Story = StoryObj<typeof EditorComponent>

export const Default: Story = {
  args: {
    content: '',
    limit: 500,
    placeholder: 'Start typing here...'
  }
}

export const WithInitialContent: Story = {
  args: {
    content: 'This is some initial content',
    limit: 500,
    placeholder: 'Start typing here...'
  }
}

export const WithCharacterLimit: Story = {
  args: {
    content: '',
    limit: 50,
    placeholder: 'You have a 50 character limit...'
  }
}

export const WithCustomPlaceholder: Story = {
  args: {
    content: '',
    limit: 500,
    placeholder: 'Custom placeholder here...'
  }
}
