import { Plugin } from 'prosemirror-state'
import { Node, Schema } from 'prosemirror-model'
import { EditorView } from 'prosemirror-view'
import { ProseMirrorExtension } from '../helpers'

const REGEX = /^!\[([^[\]]*?)\]\((.+?)\)\s+/
const MAX_MATCH = 500

const isUrl = (str: string) => {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch (_) {
    return false
  }
}

const isBlank = (text: string) => text === ' ' || text === '\xa0'

const imageInput = (schema: Schema, path?: string) =>
  new Plugin({
    props: {
      handleTextInput(view, from, to, text) {
        if (view.composing || !isBlank(text)) return false
        const $from = view.state.doc.resolve(from)
        if ($from.parent.type.spec.code) return false
        const textBefore =
          $from.parent.textBetween(
            Math.max(0, $from.parentOffset - MAX_MATCH),
            $from.parentOffset,
            null,
            '\ufffc'
          ) + text

        const match = REGEX.exec(textBefore)
        if (match) {
          const [, title, src] = match
          if (isUrl(src)) {
            const node = schema.node('image', { src, title })
            const start = from - (match[0].length - text.length)
            const tr = view.state.tr
            tr.delete(start, to)
            tr.insert(start, node)
            view.dispatch(tr)
            return true
          }

          return false
        }
      }
    }
  })

const imageSchema = {
  inline: true,
  attrs: {
    src: {},
    alt: { default: null },
    title: { default: null },
    path: { default: null },
    width: { default: null }
  },
  group: 'inline',
  draggable: true,
  parseDOM: [
    {
      tag: 'img[src]',
      getAttrs: (dom: Element) => ({
        src: dom.getAttribute('src'),
        title: dom.getAttribute('title'),
        alt: dom.getAttribute('alt'),
        path: dom.getAttribute('data-path')
      })
    }
  ],
  toDOM: (node: Node) => [
    'img',
    {
      src: node.attrs.src,
      title: node.attrs.title,
      alt: node.attrs.alt,
      'data-path': node.attrs.path
    }
  ]
}

export const insertImage = (view: EditorView, src: string, left: number, top: number) => {
  const state = view.state
  const tr = state.tr
  const node = state.schema.nodes.image.create({ src })
  const pos = view.posAtCoords({ left, top }).pos
  tr.insert(pos, node)
  view.dispatch(tr)
}

class ImageView {
  node: Node
  view: EditorView
  getPos: () => number
  schema: Schema
  dom: Element
  contentDOM: Element
  container: HTMLElement
  handle: HTMLElement
  onResizeFn: any
  onResizeEndFn: any
  width: number
  updating: number

  constructor(node: Node, view: EditorView, getPos: () => number, schema: Schema, path: string) {
    this.node = node
    this.view = view
    this.getPos = getPos
    this.schema = schema
    this.onResizeFn = this.onResize.bind(this)
    this.onResizeEndFn = this.onResizeEnd.bind(this)

    this.container = document.createElement('span')
    this.container.className = 'image-container'
    if (node.attrs.width) this.setWidth(node.attrs.width)

    const image = document.createElement('img')
    image.setAttribute('title', node.attrs.title ?? '')
    image.setAttribute('src', node.attrs.src)

    this.handle = document.createElement('span')
    this.handle.className = 'resize-handle'
    this.handle.addEventListener('mousedown', (e) => {
      e.preventDefault()
      window.addEventListener('mousemove', this.onResizeFn)
      window.addEventListener('mouseup', this.onResizeEndFn)
    })

    this.container.appendChild(image)
    this.container.appendChild(this.handle)
    this.dom = this.container
  }

  onResize(e: MouseEvent) {
    this.width = e.pageX - this.container.getBoundingClientRect().left
    this.setWidth(this.width)
  }

  onResizeEnd() {
    window.removeEventListener('mousemove', this.onResizeFn)
    if (this.updating === this.width) return
    this.updating = this.width
    const tr = this.view.state.tr
    tr.setNodeMarkup(this.getPos(), undefined, {
      ...this.node.attrs,
      width: this.width
    })

    this.view.dispatch(tr)
  }

  setWidth(width: number) {
    this.container.style.width = width + 'px'
  }
}

export default (path?: string): ProseMirrorExtension => ({
  schema: (prev) => ({
    ...prev,
    nodes: (prev.nodes as any).update('image', imageSchema)
  }),
  plugins: (prev, schema) => [...prev, imageInput(schema, path)],
  nodeViews: {
    image: (node, view, getPos) => {
      return new ImageView(node, view, getPos, view.state.schema, path)
    }
  }
})
