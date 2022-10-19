import { Plugin, NodeSelection } from 'prosemirror-state'
import { DecorationSet, Decoration } from 'prosemirror-view'
import { ProseMirrorExtension } from '../helpers'

const handleIcon = `
  <svg viewBox="0 0 10 10" height="14" width="14">
  <path d="M3 2a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2zm4-8a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2z"/>
  </svg>`

const createDragHandle = () => {
  const handle = document.createElement('span')
  handle.setAttribute('contenteditable', 'false')
  const icon = document.createElement('span')
  icon.innerHTML = handleIcon
  handle.appendChild(icon)
  handle.classList.add('handle')
  return handle
}

const handlePlugin = new Plugin({
  props: {
    decorations(state) {
      const decos = []
      state.doc.forEach((node, pos) => {
        decos.push(Decoration.widget(pos + 1, createDragHandle))
        decos.push(
          Decoration.node(pos, pos + node.nodeSize, {
            class: 'draggable'
          })
        )
      })

      return DecorationSet.create(state.doc, decos)
    },
    handleDOMEvents: {
      mousedown: (editorView, event) => {
        const target = event.target as Element
        if (target.classList.contains('handle')) {
          const pos = editorView.posAtCoords({ left: event.x, top: event.y })
          const resolved = editorView.state.doc.resolve(pos.pos)
          const tr = editorView.state.tr
          tr.setSelection(NodeSelection.create(editorView.state.doc, resolved.before()))
          editorView.dispatch(tr)
          return false
        }
      }
    }
  }
})

export default (): ProseMirrorExtension => ({
  plugins: (prev) => [...prev, handlePlugin]
})
