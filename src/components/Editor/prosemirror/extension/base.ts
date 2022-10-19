import { schema as markdownSchema } from 'prosemirror-markdown'
import { Schema } from 'prosemirror-model'
import { baseKeymap } from 'prosemirror-commands'
import { sinkListItem, liftListItem } from 'prosemirror-schema-list'
import { history } from 'prosemirror-history'
import { dropCursor } from 'prosemirror-dropcursor'
import { buildKeymap } from 'prosemirror-example-setup'
import { keymap } from 'prosemirror-keymap'
import { ProseMirrorExtension } from '../helpers'

const plainSchema = new Schema({
  nodes: {
    doc: {
      content: 'block+'
    },
    paragraph: {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM: () => ['p', 0]
    },
    text: {
      group: 'inline'
    }
  }
})

const blockquoteSchema = {
  content: 'block+',
  group: 'block',
  toDOM: () => ['div', ['blockquote', 0]]
}

export default (plain = false): ProseMirrorExtension => ({
  schema: () =>
    plain
      ? {
        nodes: plainSchema.spec.nodes,
        marks: plainSchema.spec.marks
      }
      : {
        nodes: (markdownSchema.spec.nodes as any).update('blockquote', blockquoteSchema),
        marks: markdownSchema.spec.marks
      },
  plugins: (prev, schema) => [
    ...prev,
    keymap({
      Tab: sinkListItem(schema.nodes.list_item),
      'Shift-Tab': liftListItem(schema.nodes.list_item)
    }),
    keymap({ Tab: () => true }),
    keymap(buildKeymap(schema)),
    keymap(baseKeymap),
    history(),
    dropCursor({ class: 'drop-cursor' })
  ]
})
