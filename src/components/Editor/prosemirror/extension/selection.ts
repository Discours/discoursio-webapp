import { /*MenuItem,*/ renderGrouped } from 'prosemirror-menu'
import type { Schema } from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
// import { EditorView } from 'prosemirror-view'
import type { ProseMirrorExtension } from '../state'
import { buildMenuItems } from './menu'

const cut = (arr: any[] | any) => arr.filter((a: any) => !!a)

export class SelectionTooltip {
  tooltip: any

  constructor(view: any, schema: Schema) {
    this.tooltip = document.createElement('div')
    this.tooltip.className = 'tooltip'
    view.dom.parentNode.append(this.tooltip)
    const content = cut((buildMenuItems(schema) as { [key: string]: any })?.fullMenu)

    console.debug(content)
    const { dom } = renderGrouped(view, content)

    this.tooltip.append(dom)
    this.update(view, null)
  }

  update(view: any, lastState: any) {
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
    const left = Math.max((start.left + end.left) / 2, start.left + 3)

    this.tooltip.style.left = `${left - box.left}px`
    this.tooltip.style.bottom = `${box.bottom - (start.top + 15)}px`
  }

  destroy() {
    this.tooltip.remove()
  }
}

export function toolTip(schema: any) {
  return new Plugin({
    view(editorView: any) {
      return new SelectionTooltip(editorView, schema)
    }
  })
}

export default (): ProseMirrorExtension => ({
  plugins: (prev, schema) => [...prev, toolTip(schema)]
})
