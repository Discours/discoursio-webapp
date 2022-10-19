import { Plugin, PluginKey, TextSelection, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Mark, Node, Schema } from 'prosemirror-model'
import { ProseMirrorExtension } from '../helpers'

const REGEX = /(^|\s)\[(.+)\]\(([^ ]+)(?: "(.+)")?\)/

const findMarkPosition = (mark: Mark, doc: Node, from: number, to: number) => {
  let markPos = { from: -1, to: -1 }
  doc.nodesBetween(from, to, (node, pos) => {
    if (markPos.from > -1) return false
    if (markPos.from === -1 && mark.isInSet(node.marks)) {
      markPos = { from: pos, to: pos + Math.max(node.textContent.length, 1) }
    }
  })

  return markPos
}

const pluginKey = new PluginKey('markdown-links')

const markdownLinks = (schema: Schema) =>
  new Plugin({
    key: pluginKey,
    state: {
      init() {
        return { schema }
      },
      apply(tr, state) {
        const action = tr.getMeta(this)
        if (action?.pos) {
          state.pos = action.pos
        }

        return state
      }
    },
    props: {
      handleDOMEvents: {
        keyup: (view) => {
          return handleMove(view)
        },
        click: (view, e) => {
          if (handleMove(view)) {
            e.preventDefault()
          }

          return true
        }
      }
    }
  })

const resolvePos = (view: EditorView, pos: number) => {
  try {
    return view.state.doc.resolve(pos)
  } catch (err) {
    // ignore
  }
}

const toLink = (view: EditorView, tr: Transaction) => {
  const sel = view.state.selection
  const state = pluginKey.getState(view.state)
  const lastPos = state.pos

  if (lastPos !== undefined) {
    const $from = resolvePos(view, lastPos)
    if (!$from || $from.depth === 0 || $from.parent.type.spec.code) {
      return false
    }

    const lineFrom = $from.before()
    const lineTo = $from.after()

    const line = view.state.doc.textBetween(lineFrom, lineTo, '\0', '\0')
    const match = REGEX.exec(line)

    if (match) {
      const [full, , text, href] = match
      const spaceLeft = full.indexOf(text) - 1
      const spaceRight = full.length - text.length - href.length - spaceLeft - 4
      const start = match.index + $from.start() + spaceLeft
      const end = start + full.length - spaceLeft - spaceRight

      if (sel.$from.pos >= start && sel.$from.pos <= end) {
        return false
      }

      // Do not convert md links if content has marks
      const $startPos = resolvePos(view, start)
      if ($startPos.marks().length > 0) {
        return false
      }

      const textStart = start + 1
      const textEnd = textStart + text.length

      if (textEnd < end) tr.delete(textEnd, end)
      if (textStart > start) tr.delete(start, textStart)

      const to = start + text.length
      tr.addMark(start, to, state.schema.marks.link.create({ href }))

      const sub = end - textEnd + textStart - start
      tr.setMeta(pluginKey, { pos: sel.$head.pos - sub })

      return true
    }
  }

  return false
}

const toMarkdown = (view: EditorView, tr: Transaction) => {
  const { schema } = pluginKey.getState(view.state)
  const sel = view.state.selection
  if (sel.$head.depth === 0 || sel.$head.parent.type.spec.code) {
    return false
  }

  const mark = schema.marks.link.isInSet(sel.$head.marks())
  const textFrom = sel.$head.pos - sel.$head.textOffset
  const textTo = sel.$head.after()

  if (mark) {
    const { href } = mark.attrs
    const range = findMarkPosition(mark, view.state.doc, textFrom, textTo)
    const text = view.state.doc.textBetween(range.from, range.to, '\0', '\0')
    tr.replaceRangeWith(range.from, range.to, view.state.schema.text(`[${text}](${href})`))
    tr.setSelection(new TextSelection(tr.doc.resolve(sel.$head.pos + 1)))
    tr.setMeta(pluginKey, { pos: sel.$head.pos })
    return true
  }

  return false
}

const handleMove = (view: EditorView) => {
  const sel = view.state.selection
  if (!sel.empty || !sel.$head) return false
  const pos = sel.$head.pos
  const tr = view.state.tr

  if (toLink(view, tr)) {
    view.dispatch(tr)
    return true
  }

  if (toMarkdown(view, tr)) {
    view.dispatch(tr)
    return true
  }

  tr.setMeta(pluginKey, { pos })
  view.dispatch(tr)
  return false
}

export default (): ProseMirrorExtension => ({
  plugins: (prev, schema) => [...prev, markdownLinks(schema)]
})
