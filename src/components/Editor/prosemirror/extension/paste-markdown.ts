import { Plugin } from 'prosemirror-state'
// import { Fragment, Node, Schema } from 'prosemirror-model'
import type { Schema } from 'prosemirror-model'
import type { ProseMirrorExtension } from '../../store/state'
// import { createMarkdownParser } from '../markdown'

// const URL_REGEX = /(ftp|http|https):\/\/(\w+(?::\w*)?@)?(\S+)(:\d+)?(\/|\/([\w!#%&+./:=?@-]))?/g

// const transform = (schema: Schema, fragment: Fragment) => {
//   const nodes: Node[] = []
//
//   fragment.forEach((child: Node) => {
//     if (child.isText) {
//       let pos = 0
//       let match: RegExpMatchArray | null
//
//       while ((match = URL_REGEX.exec(child.text as string)) !== null) {
//         const start = match.index as number
//         const end = start + match[0].length
//         const attrs = { href: match[0] }
//
//         if (start > 0) {
//           nodes.push(child.cut(pos, start))
//         }
//
//         const node = child.cut(start, end).mark(schema.marks.link.create(attrs).addToSet(child.marks))
//
//         nodes.push(node)
//         pos = end
//       }
//
//       if (pos < (child.text as string).length) {
//         nodes.push(child.cut(pos))
//       }
//     } else {
//       nodes.push(child.copy(transform(schema, child.content)))
//     }
//   })
//
//   return Fragment.fromArray(nodes)
// }

// let shiftKey = false

const pasteMarkdown = (_schema: Schema) => {
  // const parser = createMarkdownParser(schema)

  return new Plugin({
    props: {
      handleDOMEvents: {
        keydown: (_, _event) => {
          // shiftKey = event.shiftKey

          return false
        },
        keyup: () => {
          // shiftKey = false

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

        // const paste = parser.parse(text)

        // FIXME !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // paste is Node why ...paste?
        // const slice = [...paste]
        // const fragment = shiftKey ? slice.content : transform(schema, slice.content)
        // const tr = view.state.tr.replaceSelection(new Slice(fragment, slice.openStart, slice.openEnd))
        //
        // view.dispatch(tr)

        return true
      }
    }
  })
}

export default (): ProseMirrorExtension => ({
  plugins: (prev, schema) => [...prev, pasteMarkdown(schema)]
})
