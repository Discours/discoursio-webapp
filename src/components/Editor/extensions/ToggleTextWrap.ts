import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggleSpanWrap: {
      addTextWrap: (attributes: { class: string }) => ReturnType
      removeTextWrap: (attributes: { class: string }) => ReturnType
    }
  }
}

export const ToggleTextWrap = Extension.create({
  name: 'toggleTextWrap',

  addCommands() {
    return {
      addTextWrap:
        (attributes) =>
        ({ commands, state: _s }) => {
          return commands.setMark('span', attributes)
        },

      removeTextWrap:
        (attributes) =>
        ({ state, dispatch }) => {
          let tr = state.tr
          let changesApplied = false

          state.doc.descendants((node, pos) => {
            if (node.isInline) {
              node.marks.forEach((mark) => {
                if (mark.type.name === 'span' && mark.attrs.class === attributes.class) {
                  const end = pos + node.nodeSize
                  tr = tr.removeMark(pos, end, mark.type)
                  changesApplied = true
                }
              })
            }
          })

          if (changesApplied) {
            dispatch?.(tr)
            return true
          }
          return false
        }
    }
  }
})
