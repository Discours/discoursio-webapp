import { Blockquote, BlockquoteOptions } from '@tiptap/extension-blockquote'

export type QuoteTypes = 'quote' | 'punchline'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    CustomBlockquote: {
      toggleBlockquote: (type: QuoteTypes) => ReturnType
      setBlockQuoteFloat: (float: null | 'left' | 'right') => ReturnType
    }
  }
}

export const CustomBlockquote = Blockquote.extend({
  addAttributes() {
    return {
      'data-float': {
        default: null
      },
      'data-type': {
        default: null
      }
    }
  },
  addCommands() {
    return {
      toggleBlockquote:
        (type) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, { 'data-type': type })
        },
      setBlockQuoteFloat:
        (value) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { 'data-float': value })
        }
    }
  }
})
