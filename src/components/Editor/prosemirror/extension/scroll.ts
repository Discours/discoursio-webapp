import { Plugin } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { ProseMirrorExtension } from '../helpers'

const scroll = (view: EditorView) => {
  if (!view.state.selection.empty) return false
  const pos = view.state.selection.$head.start()
  const resolved = view.state.doc.resolve(pos)
  if (resolved.parent.type.spec.code) return false

  const dom = view.domAtPos(pos)
  if (dom.node !== view.dom) {
    scrollToElem(dom.node as Element)
  }
}

const scrollToElem = (node: Element) => {
  node.scrollIntoView({
    block: 'center',
    behavior: 'smooth'
  })
}

const scrollIntoView = new Plugin({
  props: {
    handleDOMEvents: {
      keyup: (view: EditorView) => {
        scroll(view)
        return false
      }
    }
  }
})

export default (enabled: boolean): ProseMirrorExtension => ({
  plugins: (prev) => (enabled ? [...prev, scrollIntoView] : prev)
})
