import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    Article: {
      toggleArticle: () => ReturnType
      setArticleFloat: (float: null | 'half-left' | 'half-right') => ReturnType
      setArticleBg: (bg: null | string) => ReturnType
    }
  }
}

export const ArticleNode = Node.create({
  name: 'article',
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

  addOptions() {
    return {
      'data-type': 'incut'
    }
  },

  addAttributes() {
    return {
      'data-float': {
        default: null
      },
      'data-bg': {
        default: null
      }
    }
  },

  addCommands() {
    return {
      toggleArticle:
        () =>
        // eslint-disable-next-line unicorn/consistent-function-scoping
        ({ commands }) => {
          return commands.toggleWrap('article')
        },
      setArticleFloat:
        (value) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { 'data-float': value })
        },
      setArticleBg:
        (value) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { 'data-bg': value })
        }
    }
  }
})

export default ArticleNode
