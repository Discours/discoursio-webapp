import type { EditorView, NodeView, NodeViewConstructor } from 'prosemirror-view'
import type { Node } from 'prosemirror-model'

class ImageView implements NodeView {
  node: Node
  view: EditorView
  getPos: () => number
  dom: Element
  container: HTMLElement
  handle: HTMLElement
  onResizeFn: any
  onResizeEndFn: any
  width: number
  updating: number

  constructor(node: Node, view: EditorView, getPos: () => number) {
    this.node = node
    this.view = view
    this.getPos = getPos
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

export const createImageView: NodeViewConstructor = (node: Node, view: EditorView, getPos: () => number) =>
  new ImageView(node, view, getPos)
