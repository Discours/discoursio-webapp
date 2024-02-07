import { Mark, mergeAttributes } from '@tiptap/core'

export const Span = Mark.create({
  name: 'span',

  parseHTML() {
    return [
      {
        tag: 'span[class]',
        getAttrs: (dom) => {
          if (dom instanceof HTMLElement) {
            return { class: dom.getAttribute('class') }
          }
          return false
        }
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0]
  },

  addAttributes() {
    return {
      class: {
        default: null
      }
    }
  }
})
