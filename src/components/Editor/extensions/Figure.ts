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
  content: 'image figcaption | iframe figcaption',
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      'data-float': null,
      'data-type': { default: null },
    }
  },

  // parseHTML() {
  //   return [
  //     {
  //       tag: `figure[data-type="${this.name}"]`,
  //     },
  //   ]
  // },

  parseHTML() {
    return [
      {
        tag: 'figure',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) {
            return
          }
          const img = node.querySelector('img')
          const iframe = node.querySelector('iframe')
          let dataType = null
          if (img) {
            dataType = 'image'
          } else if (iframe) {
            dataType = 'iframe'
          }
          return { 'data-type': dataType }
        },
      },
    ]
  },
  //
  // renderHTML({ HTMLAttributes }) {
  //   return ['figure', mergeAttributes(HTMLAttributes, { 'data-type': this.name }), 0]
  // },
  renderHTML({ node, HTMLAttributes }) {
    let imgNode = null
    let iframeNode = null
    let figcaptionNode = null

    node.content.forEach((childNode) => {
      switch (childNode.type.name) {
        case 'image': {
          imgNode = childNode
          break
        }
        case 'iframe': {
          iframeNode = childNode
          break
        }
        case 'figcaption': {
          figcaptionNode = childNode
          break
        }
      }
    })

    const content = []
    if (imgNode) {
      content.push(['img', imgNode.attrs])
    } else if (iframeNode) {
      content.push(['iframe', iframeNode.attrs])
    }

    if (figcaptionNode) {
      content.push(['figcaption', 0, figcaptionNode.textContent])
    }

    return ['figure', mergeAttributes(HTMLAttributes), ...content]
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
