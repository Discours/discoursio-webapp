import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs'
import { Icon } from '~/components/_shared/Icon/Icon'
import { ToolbarControl } from './ToolbarControl'

const meta: Meta<typeof ToolbarControl> = {
  title: 'Editor/Toolbar/ToolbarControl',
  component: ToolbarControl,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof ToolbarControl>

const createMockEditor = () => {
  return new Editor({
    extensions: [StarterKit],
    content: '<p>Пример текста</p>'
  })
}

export const Default: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    return (
      <ToolbarControl
        editor={editor()}
        caption="Жирный"
        key="bold"
        onChange={() => console.log('Изменено')}
      >
        <Icon name="editor-bold" />
      </ToolbarControl>
    )
  }
}

export const Active: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    return (
      <ToolbarControl
        editor={editor()}
        caption="Жирный"
        key="bold"
        onChange={() => console.log('Изменено')}
        isActive={() => true}
      >
        <Icon name="editor-bold" />
      </ToolbarControl>
    )
  }
}

export const WithoutCaption: Story = {
  render: () => {
    const [editor] = createSignal(createMockEditor())
    return (
      <ToolbarControl editor={editor()} key="bold" onChange={() => console.log('Изменено')}>
        <Icon name="editor-bold" />
      </ToolbarControl>
    )
  }
}
