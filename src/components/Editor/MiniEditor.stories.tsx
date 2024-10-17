import type { Meta, StoryObj } from 'storybook-solidjs'
import { MiniEditor } from './MiniEditor'
import { createMock } from 'storybook-addon-vite-mock'
import { useUI } from '~/context/ui'
import { render } from 'solid-js/web'

const meta = {
  title: 'Editor/MiniEditor',
  component: MiniEditor,
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(useUI);
        return [mock];
      },
    },
  },
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
} satisfies Meta<typeof MiniEditor>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    content: '',
    limit: 500,
    placeholder: 'Start typing here...'
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const mockShowModal = (s: string) => {}; // Простая заглушка
    (useUI as any).mockReturnValue({ showModal: mockShowModal });
     
      
  render(() => <MiniEditor {...Default.args} />, canvasElement);

  },
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
