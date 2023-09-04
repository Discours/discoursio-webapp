import { mergeAttributes, Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    Footnote: {
      setFootnote: (options: { value: string }) => ReturnType
      updateFootnote: (options: { value: string }) => ReturnType
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
        parseHTML: (element) => element.dataset.value || null,
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
          return true
        },
      updateFootnote:
        (newValue) =>
        ({ tr, state }) => {
          const { selection } = state
          const { $from, $to } = selection

          if ($from.parent.type.name === 'footnote' || $to.parent.type.name === 'footnote') {
            const node = $from.parent.type.name === 'footnote' ? $from.parent : $to.parent
            const pos = $from.parent.type.name === 'footnote' ? $from.pos - 1 : $to.pos - 1

            const newNode = node.type.create({ value: newValue })
            tr.setNodeMarkup(pos, null, newNode.attrs)

            return true
          }

          return false
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
