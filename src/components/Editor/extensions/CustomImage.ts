import { Image } from '@tiptap/extension-image'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customImage: {
      /**
       * Add an image
       */
      setImage: (options: { src: string; alt?: string; title?: string }) => ReturnType
      setImageFloat: (float: null | 'left' | 'right') => ReturnType
    }
  }
}

export const CustomImage = Image.extend({
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
  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options
          })
        },
      setImageFloat:
        (value) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { 'data-float': value })
        }
    }
  }
})
