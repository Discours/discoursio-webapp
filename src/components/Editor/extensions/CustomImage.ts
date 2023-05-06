import Image from '@tiptap/extension-image'
import { mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableMedia: {
      setFloat: (float: 'none' | 'left' | 'right') => ReturnType
    }
  }
}

export const updateAttrs = (attrs, editor, node) => {
  const { view } = editor
  if (!view.editable) return
  const { state } = view
  const newAttrs = { ...node.attrs, ...attrs }
  const { from } = state.selection
  const transaction = state.tr.setNodeMarkup(from, null, newAttrs)
  view.dispatch(transaction)
}

export default Image.extend({
  addAttributes() {
    return {
      src: {
        default: null
      },
      alt: {
        default: null
      },
      width: {
        default: null
      },
      height: {
        default: null
      },
      'data-float': {
        default: null
      }
    }
  },
  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },
  addCommands() {
    return {
      setFloat:
        (value) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { 'data-float': value })
        }
    }
  }
})
