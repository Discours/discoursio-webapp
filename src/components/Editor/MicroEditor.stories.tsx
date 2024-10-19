import { Meta, StoryObj } from 'storybook-solidjs'
import { MicroEditor } from './MicroEditor'

const meta: Meta<typeof MicroEditor> = {
  title: 'Editor/MicroEditor',
  component: MicroEditor,
  argTypes: {
    content: {
      control: 'text',
      description: 'Initial content for the editor',
      defaultValue: ''
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

type Story = StoryObj<typeof MicroEditor>

export const Default: Story = {
  args: {
    content: '',
    placeholder: 'Start typing here...',
    onChange: (content: string) => console.log('Content changed:', content)
  }
}

export const WithInitialContent: Story = {
  args: {
    content: 'This is some initial content.',
    placeholder: 'Start typing here...',
    onChange: (content: string) => console.log('Content changed:', content)
  }
}

export const WithCustomPlaceholder: Story = {
  args: {
    content: '',
    placeholder: 'Type your text here...',
    onChange: (content: string) => console.log('Content changed:', content)
  }
}
