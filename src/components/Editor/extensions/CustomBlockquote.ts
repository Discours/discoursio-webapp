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
  name: 'blockquote',
  group: 'block',
  content: 'block+',

  addOptions(): BlockquoteOptions {
    return {
      HTMLAttributes: { class: 'blockquote' }
    } as BlockquoteOptions
  },

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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  addCommands() {
    return {
      toggleBlockquote:
        (type) =>
        ({ commands }) =>
          commands.toggleWrap(this.name, { 'data-type': type }),
      setBlockQuoteFloat:
        (value) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { 'data-float': value })
    }
  }
})
