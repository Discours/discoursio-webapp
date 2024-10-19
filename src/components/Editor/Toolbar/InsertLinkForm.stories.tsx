import { Editor } from '@tiptap/core'
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs'
import { InsertLinkForm } from './InsertLinkForm'

const meta: Meta<typeof InsertLinkForm> = {
  title: 'Editor/Toolbar/InsertLinkForm',
  component: InsertLinkForm,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof InsertLinkForm>

const createMockEditor = () => {
  return new Editor({
    extensions: [StarterKit, Link],
    content: '<p>Текст с <a href="https://example.com">ссылкой</a></p>'
  })
}

export const Default: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    return (
      <InsertLinkForm
        editor={editor()}
        onClose={() => console.log('Форма закрыта')}
        onSubmit={(value) => console.log('Отправлено:', value)}
        onRemove={() => console.log('Ссылка удалена')}
      />
    )
  }
}

export const WithInitialLink: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    editor().commands.setTextSelection({ from: 10, to: 16 })
    return (
      <InsertLinkForm
        editor={editor()}
        onClose={() => console.log('Форма закрыта')}
        onSubmit={(value) => console.log('Отправлено:', value)}
        onRemove={() => console.log('Ссылка удалена')}
      />
    )
  }
}
