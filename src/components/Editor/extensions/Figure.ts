import { mergeAttributes, Node } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    Figure: {
      setFigureFloat: (float: null | 'left' | 'right') => ReturnType
    }
  }
}
export const Figure = Node.create({
  name: 'figure',
  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },
  group: 'block',
  content: 'block figcaption',
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      'data-float': null,
    }
  },

  parseHTML() {
    return [
      {
        tag: `figure[data-type="${this.name}"]`,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['figure', mergeAttributes(HTMLAttributes, { 'data-type': this.name }), 0]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            // prevent dragging nodes out of the figure
            dragstart: (view, event) => {
              if (!event.target) {
                return false
              }
              const pos = view.posAtDOM(event.target as HTMLElement, 0)
              const $pos = view.state.doc.resolve(pos)
              if ($pos.parent.type === this.type) {
                event.preventDefault()
              }
              return false
            },
          },
        },
      }),
    ]
  },

  addCommands() {
    return {
      setFigureFloat:
        (value) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { 'data-float': value })
        },
    }
  },
})
