import { Editor } from '@tiptap/core'
import Image from '@tiptap/extension-image'
import StarterKit from '@tiptap/starter-kit'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs'
import { FigureBubbleMenu } from './FigureBubbleMenu'

const meta: Meta<typeof FigureBubbleMenu> = {
  title: 'Editor/Toolbar/FigureBubbleMenu',
  component: FigureBubbleMenu,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof FigureBubbleMenu>

const createMockEditor = () => {
  return new Editor({
    extensions: [StarterKit, Image],
    content:
      '<figure><img src="https://example.com/image.jpg" alt="Пример изображения" /><figcaption>Подпись к изображению</figcaption></figure>'
  })
}

export const Default: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    return (
      <div style={{ padding: '20px' }}>
        <FigureBubbleMenu editor={editor()} ref={(el) => console.log('Ref:', el)} />
      </div>
    )
  }
}

export const WithAlignment: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    return (
      <div style={{ padding: '20px' }}>
        <FigureBubbleMenu editor={editor()} ref={(el) => console.log('Ref:', el)} />
        <p>Используйте кнопки выравнивания для изменения позиции изображения</p>
      </div>
    )
  }
}

export const WithCaption: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    return (
      <div style={{ padding: '20px' }}>
        <FigureBubbleMenu editor={editor()} ref={(el) => console.log('Ref:', el)} />
        <p>Нажмите на кнопку "Добавить подпись" для добавления подписи к изображению</p>
      </div>
    )
  }
}
