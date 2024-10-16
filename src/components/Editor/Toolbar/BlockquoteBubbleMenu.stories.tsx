import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs'
import { BlockquoteBubbleMenu } from './BlockquoteBubbleMenu'

const meta: Meta<typeof BlockquoteBubbleMenu> = {
  title: 'Editor/Toolbar/BlockquoteBubbleMenu',
  component: BlockquoteBubbleMenu,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof BlockquoteBubbleMenu>

const createMockEditor = () => {
  return new Editor({
    extensions: [StarterKit],
    content: '<blockquote>Это пример цитаты</blockquote>'
  })
}

export const Default: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    return (
      <div style={{ padding: '50px' }}>
        <BlockquoteBubbleMenu editor={editor()} ref={(el) => console.log('Ref:', el)} />
      </div>
    )
  }
}

export const LeftAligned: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    editor().commands.setBlockQuoteFloat('left')
    return (
      <div style={{ padding: '50px' }}>
        <BlockquoteBubbleMenu editor={editor()} ref={(el) => console.log('Ref:', el)} />
        <p>Цитата выровнена по левому краю</p>
      </div>
    )
  }
}

export const RightAligned: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    editor().commands.setBlockQuoteFloat('right')
    return (
      <div style={{ padding: '50px' }}>
        <BlockquoteBubbleMenu editor={editor()} ref={(el) => console.log('Ref:', el)} />
        <p>Цитата выровнена по правому краю</p>
      </div>
    )
  }
}
