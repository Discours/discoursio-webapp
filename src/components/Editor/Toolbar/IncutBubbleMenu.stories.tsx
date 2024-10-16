import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs'
import { IncutBubbleMenu } from './IncutBubbleMenu'

const meta: Meta<typeof IncutBubbleMenu> = {
  title: 'Editor/Toolbar/IncutBubbleMenu',
  component: IncutBubbleMenu,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof IncutBubbleMenu>

const createMockEditor = () => {
  return new Editor({
    extensions: [StarterKit],
    content: '<p>Пример текста для вставки</p>'
  })
}

export const Default: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    return (
      <div style={{ padding: '20px' }}>
        <IncutBubbleMenu editor={editor()} ref={(el) => console.log('Ref:', el)} />
      </div>
    )
  }
}

export const WithBackgroundSelection: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    return (
      <div style={{ padding: '20px' }}>
        <IncutBubbleMenu editor={editor()} ref={(el) => console.log('Ref:', el)} />
        <p>Нажмите на кнопку "Substrate" для выбора фона</p>
      </div>
    )
  }
}

export const WithFloatOptions: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    return (
      <div style={{ padding: '20px' }}>
        <IncutBubbleMenu editor={editor()} ref={(el) => console.log('Ref:', el)} />
        <p>Используйте кнопки выравнивания для изменения позиции вставки</p>
      </div>
    )
  }
}
