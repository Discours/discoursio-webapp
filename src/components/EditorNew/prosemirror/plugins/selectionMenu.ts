import { renderGrouped } from 'prosemirror-menu'
import { EditorState, Plugin } from 'prosemirror-state'
import styles from '../styles/ProseMirror.module.scss'
import type { EditorView } from 'prosemirror-view'
import type { DiscoursSchema } from '../schema'
import { buildMenuItems } from '../helpers/menu'

export class SelectionMenuView {
  tooltip: HTMLDivElement

  constructor(view: EditorView, schema: DiscoursSchema) {
    this.tooltip = document.createElement('div')
    this.tooltip.className = styles.selectionMenu
    view.dom.parentNode.appendChild(this.tooltip)
    const { dom } = renderGrouped(view, buildMenuItems(schema))
    this.tooltip.appendChild(dom)
    this.update(view, null)
  }

  update(view: EditorView, lastState: EditorState) {
    const state = view.state

    if (lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) {
      return
    }

    if (state.selection.empty) {
      this.tooltip.style.display = 'none'
      return
    }

    this.tooltip.style.display = ''
    const { from, to } = state.selection
    const start = view.coordsAtPos(from)
    const end = view.coordsAtPos(to)
    const box = this.tooltip.offsetParent.getBoundingClientRect()
    const width = this.tooltip.getBoundingClientRect().width
    const left = (start.left + end.left - width) / 2
    this.tooltip.style.left = `${left - box.left}px`
    this.tooltip.style.bottom = `${box.bottom - start.top + 8}px`
  }

  destroy() {
    this.tooltip.remove()
  }
}

export const selectionMenu = (schema: DiscoursSchema) =>
  new Plugin({
    view(editorView: EditorView) {
      return new SelectionMenuView(editorView, schema)
    }
  })
