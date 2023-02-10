import { Schema } from 'prosemirror-model'

export const schema = new Schema({
  nodes: {
    doc: {
      content: 'block+'
    },
    text: {
      group: 'inline',
      inline: true
    },
    paragraph: {
      content: 'inline*',
      group: 'block',
      toDOM: function toDOM() {
        return ['p', { class: 'paragraph' }, 0]
      }
    },
    blockquote: {
      content: 'block+',
      group: 'block',
      defining: true,
      parseDOM: [{ tag: 'blockquote' }],
      toDOM() {
        return ['blockquote', 0]
      }
    }
  },
  marks: {
    strong: {
      toDOM() {
        return ['strong', 0]
      },
      parseDOM: [{ tag: 'strong' }, { tag: 'b' }, { style: 'font-weight=bold' }]
    },
    em: {
      toDOM() {
        return ['em', 0]
      },
      parseDOM: [{ tag: 'em' }, { tag: 'i' }, { style: 'font-style=italic' }]
    }
  }
})
