import { mergeAttributes, Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    Figcaption: {
      setFigcaptionFocus: (value: boolean) => ReturnType
    }
  }
}
export const Figcaption = Node.create({
  name: 'figcaption',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  content: 'inline*',

  selectable: false,

  draggable: false,

  parseHTML() {
    return [
      {
        tag: 'figcaption',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['figcaption', mergeAttributes(HTMLAttributes), 0]
  },
  addCommands() {
    return {
      setFigcaptionFocus:
        (value) =>
        ({ commands }) => {
          return commands.focus(value)
        },
    }
  },
})
