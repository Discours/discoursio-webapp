import { Node, mergeAttributes } from '@tiptap/core'
import { Command } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    Article: {
      toggleArticle: () => ReturnType
      setArticleFloat: (float: null | 'left' | 'right') => ReturnType
    }
  }
}

export default Node.create({
  name: 'article',

  defaultOptions: {
    HTMLAttributes: {
      'data-type': 'squib'
    }
  },

  group: 'block',

  content: 'block+',

  parseHTML() {
    return [
      {
        tag: 'article'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['article', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addAttributes() {
    return {
      bgColor: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.bgColor) {
            return {}
          }

          return {
            'data-bgColor': attributes.bgColor
          }
        },
        parseHTML: (element) => ({
          bgColor: element.dataset.bgcolor
        })
      }
    }
  },

  addCommands() {
    return {
      toggleArticle:
        () =>
        ({ commands }) => {
          return commands.toggleWrap('article')
        },
      setArticleFloat:
        (float: null | 'left' | 'right') =>
        ({ tr, state: { selection, doc }, dispatch }) => {
          if (dispatch) {
            const node = doc.nodeAt(selection.from)
            if (node?.type.name === 'article') {
              const newAttrs = { ...node.attrs, float }
              const transaction = tr.setNodeMarkup(selection.from, undefined, newAttrs)
              dispatch(transaction)
              return true
            }
          }
          return false
        }
    }
  }
})
