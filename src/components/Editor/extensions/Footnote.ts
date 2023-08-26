import { mergeAttributes, Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    Footnote: {
      setFootnote: (options: { value: string }) => ReturnType
      deleteFootnote: () => ReturnType
    }
  }
}

export const Footnote = Node.create({
  name: 'footnote',
  addOptions() {
    return {
      HTMLAttributes: {}
    }
  },
  group: 'inline',
  content: 'text*',
  inline: true,
  isolating: true,

  addAttributes() {
    return {
      value: {
        default: null,
        parseHTML: (element) => {
          return {
            value: element.dataset.value
          }
        },
        renderHTML: (attributes) => {
          return {
            'data-value': attributes.value
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'footnote'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['footnote', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setFootnote:
        (attributes) =>
        ({ tr, state }) => {
          const { selection } = state
          const position = selection.$to.pos

          console.log('!!! attributes:', attributes)
          const node = this.type.create(attributes)
          tr.insert(position, node)
          tr.insertText('\u00A0', position + 1) // it's make selection visible
          return true
        },
      deleteFootnote:
        () =>
        ({ tr, state }) => {
          const { selection } = state
          const { $from, $to } = selection

          if ($from.parent.type.name === 'footnote' || $to.parent.type.name === 'footnote') {
            const startPos = $from.start($from.depth)
            const endPos = $to.end($to.depth)
            tr.delete(startPos, endPos)
            return true
          }

          return false
        }
    }
  }
})
