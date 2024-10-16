import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs'
import { MicroBubbleMenu } from './MicroBubbleMenu'

const meta: Meta<typeof MicroBubbleMenu> = {
  title: 'Editor/Toolbar/MicroBubbleMenu',
  component: MicroBubbleMenu,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof MicroBubbleMenu>

const createMockEditor = () => {
  return new Editor({
    extensions: [StarterKit],
    content: '<p>Выделите этот текст, чтобы увидеть MicroBubbleMenu</p>'
  })
}

export const Default: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    return <MicroBubbleMenu editor={editor} />
  }
}

export const WithoutBorders: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    return <MicroBubbleMenu editor={editor} noBorders={true} />
  }
}
