import { Plugin } from 'prosemirror-state'
import type { DiscoursSchema } from '../schema'

const REGEX = /^!\[([^[\]]*?)]\((.+?)\)\s+/
const MAX_MATCH = 500

const isUrl = (str: string) => {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const isBlank = (text: string) => text === ' ' || text === '\u00A0'

export const imageInput = (schema: DiscoursSchema) =>
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
            '\uFFFC'
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
