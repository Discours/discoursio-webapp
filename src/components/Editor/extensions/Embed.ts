import { mergeAttributes, Node } from '@tiptap/core'

export interface IframeOptions {
  allowFullscreen: boolean
  HTMLAttributes: {
    [key: string]: any
  }
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    iframe: {
      setIframe: (options: { src: string }) => ReturnType
    }
  }
}

export const Embed = Node.create<IframeOptions>({
  name: 'embed',
  group: 'block',
  selectable: true,
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      width: { default: null },
      height: { default: null }
    }
  },
  parseHTML() {
    return [
      {
        tag: 'iframe'
      }
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['iframe', mergeAttributes(HTMLAttributes)]
  },
  addNodeView() {
    return ({ node }) => {
      const div = document.createElement('div')
      div.className = 'embed-wrapper'
      const iframe = document.createElement('iframe')
      iframe.width = node.attrs.width
      iframe.height = node.attrs.height
      iframe.allowFullscreen = node.attrs.allowFullscreen
      iframe.src = node.attrs.src
      div.append(iframe)
      return {
        dom: div
      }
    }
  },
  addCommands() {
    return {
      setIframe:
        (options) =>
        ({ tr, dispatch }) => {
          const { selection } = tr
          const node = this.type.create(options)
          if (dispatch) {
            tr.replaceRangeWith(selection.from, selection.to, node)
          }
          return true
        }
    }
  }
})
