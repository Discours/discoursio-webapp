import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs'
import { FullBubbleMenu } from './FullBubbleMenu'

const meta: Meta<typeof FullBubbleMenu> = {
  title: 'Editor/Toolbar/FullBubbleMenu',
  component: FullBubbleMenu,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof FullBubbleMenu>

const createMockEditor = () => {
  return new Editor({
    extensions: [StarterKit],
    content: '<p>Пример текста для редактирования</p>'
  })
}

export const Default: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    const [shouldShow, setShouldShow] = createSignal(true)
    return (
      <div style={{ padding: '20px' }}>
        <FullBubbleMenu editor={() => editor()} shouldShow={() => shouldShow()} />
        <button onClick={() => setShouldShow((x) => !x)}>
          {shouldShow() ? 'Скрыть меню' : 'Показать меню'}
        </button>
      </div>
    )
  }
}

export const CommonMarkup: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    return (
      <div style={{ padding: '20px' }}>
        <FullBubbleMenu editor={() => editor()} shouldShow={() => true} isCommonMarkup={true} />
      </div>
    )
  }
}

export const WithFigcaption: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    editor().commands.setContent('<figcaption>Подпись к изображению</figcaption>')
    return (
      <div style={{ padding: '20px' }}>
        <FullBubbleMenu editor={() => editor()} shouldShow={() => true} />
      </div>
    )
  }
}
