import { InputRule } from 'prosemirror-inputrules'
import type { EditorState } from 'prosemirror-state'
import type { MarkType } from 'prosemirror-model'

export const markInputRule = (regexp: RegExp, nodeType: MarkType, getAttrs?) =>
  // FIXME ?
  new InputRule(regexp, (state: EditorState, match: string[], start: number, endArg: number) => {
    const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs
    const tr = state.tr
    let end = endArg
    if (match[1]) {
      const textStart = start + match[0].indexOf(match[1])
      const textEnd = textStart + match[1].length
      let hasMarks = false
      state.doc.nodesBetween(textStart, textEnd, (node) => {
        hasMarks = node.marks.length > 0
      })
      if (hasMarks) return
      if (textEnd < end) tr.delete(textEnd, end)
      if (textStart > start) tr.delete(start, textStart)
      end = start + match[1].length
    }
    tr.addMark(start, end, nodeType.create(attrs))
    tr.removeStoredMark(nodeType)
    return tr
  })
