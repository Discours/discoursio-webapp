import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs'
import { EditorFloatingMenu } from './EditorFloatingMenu'

const meta: Meta<typeof EditorFloatingMenu> = {
  title: 'Editor/Toolbar/EditorFloatingMenu',
  component: EditorFloatingMenu,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof EditorFloatingMenu>

const createMockEditor = () => {
  return new Editor({
    extensions: [StarterKit],
    content: '<p>Нажмите на кнопку "+" для открытия меню</p>'
  })
}

export const Default: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    return (
      <div style={{ padding: '50px' }}>
        <EditorFloatingMenu editor={editor()} ref={(el) => console.log('Ref:', el)} />
      </div>
    )
  }
}

export const OpenMenu: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    return (
      <div style={{ padding: '50px' }}>
        <EditorFloatingMenu editor={editor()} ref={(el) => console.log('Ref:', el)} />
        <p>Меню открыто. Выберите опцию для вставки.</p>
      </div>
    )
  }
}

export const WithImageUpload: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    return (
      <div style={{ padding: '50px' }}>
        <EditorFloatingMenu editor={editor()} ref={(el) => console.log('Ref:', el)} />
        <p>Нажмите на кнопку "Изображение" для открытия модального окна загрузки.</p>
      </div>
    )
  }
}
