import { Plugin, Transaction } from 'prosemirror-state'
import { Fragment, Node, Schema, Slice } from 'prosemirror-model'
import type { ProseMirrorExtension } from '../helpers'
import { createMarkdownParser } from '../../markdown'
// import { openPrompt } from './prompt'

const URL_REGEX = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:\d+)?(\/|\/([\w!#%&+./:=?@-]))?/g

const transform = (schema: Schema, fragment: Fragment) => {
  const nodes = []
  fragment.forEach((child: Node) => {
    if (child.isText) {
      let pos = 0
      let match: RegExpExecArray

      while ((match = URL_REGEX.exec(child.text)) !== null) {
        const start = match.index
        const end = start + match[0].length
        const attrs = { href: match[0] }

        if (start > 0) {
          nodes.push(child.cut(pos, start))
        }

        const node = child.cut(start, end).mark(schema.marks.link.create(attrs).addToSet(child.marks))
        nodes.push(node)
        pos = end
      }

      if (pos < child.text.length) {
        nodes.push(child.cut(pos))
      }
    } else {
      nodes.push(child.copy(transform(schema, child.content)))
    }
  })

  return Fragment.fromArray(nodes)
}

let shiftKey = false

const pasteMarkdown = (schema: Schema) => {
  const parser = createMarkdownParser(schema)
  return new Plugin({
    props: {
      handleDOMEvents: {
        keydown: (_, event) => {
          shiftKey = event.shiftKey
          return false
        },
        keyup: () => {
          shiftKey = false
          return false
        }
      },
      handlePaste: (view, event) => {
        if (!event.clipboardData) return false
        const text = event.clipboardData.getData('text/plain')
        const html = event.clipboardData.getData('text/html')
        // otherwise, if we have html then fallback to the default HTML
        // parser behavior that comes with Prosemirror.
        if (text.length === 0 || html) return false
        event.preventDefault()
        const node: Node = parser.parse(text)
        const fragment = shiftKey ? node.content : transform(schema, node.content)
        const openStart = 0 // FIXME
        const openEnd = text.length // FIXME: detect real start and end cursor position
        const tr: Transaction = view.state.tr.replaceSelection(new Slice(fragment, openStart, openEnd))

        view.dispatch(tr)
        return true
      }
    }
  })
}

export default (): ProseMirrorExtension => ({
  plugins: (prev, schema) => [...prev, pasteMarkdown(schema)]
})
