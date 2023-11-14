import { Blockquote } from '@tiptap/extension-blockquote'

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
  name: 'blockquote',
  defaultOptions: {
    HTMLAttributes: {},
  },
  group: 'block',
  content: 'block+',
  addAttributes() {
    return {
      'data-float': {
        default: null,
      },
      'data-type': {
        default: null,
      },
    }
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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
        },
    }
  },
})
