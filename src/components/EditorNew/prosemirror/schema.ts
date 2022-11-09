import { Node, Schema, SchemaSpec } from 'prosemirror-model'

export type Nodes =
  | 'doc'
  | 'paragraph'
  | 'text'
  | 'heading'
  | 'ordered_list'
  | 'bullet_list'
  | 'list_item'
  | 'blockquote'
  | 'image'
  | 'embed'

export type Marks = 'strong' | 'em' | 'strikethrough' | 'note' | 'link' | 'highlight'

export type DiscoursSchema = Schema<Nodes, Marks>

export const schemaSpec: SchemaSpec<Nodes, Marks> = {
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
    },
    heading: {
      attrs: { level: { default: 1 } },
      content: 'inline*',
      group: 'block',
      defining: true,
      parseDOM: [
        { tag: 'h1', attrs: { level: 1 } },
        { tag: 'h2', attrs: { level: 2 } },
        { tag: 'h3', attrs: { level: 3 } }
      ],
      toDOM(node) {
        return ['h' + node.attrs.level, 0]
      }
    },
    ordered_list: {
      group: 'block',
      content: 'list_item+',
      attrs: { order: { default: 1 } },
      parseDOM: [
        {
          tag: 'ol',
          getAttrs(dom: HTMLElement) {
            return { order: dom.hasAttribute('start') ? +dom.getAttribute('start') : 1 }
          }
        }
      ],
      toDOM(node) {
        return node.attrs.order === 1 ? ['ol', 0] : ['ol', { start: node.attrs.order }, 0]
      }
    },
    bullet_list: {
      group: 'block',
      content: 'list_item+',
      parseDOM: [{ tag: 'ul' }],
      toDOM() {
        return ['ul', 0]
      }
    },
    list_item: {
      content: 'paragraph block*',
      parseDOM: [{ tag: 'li' }],
      toDOM() {
        return ['li', 0]
      },
      defining: true
    },
    blockquote: {
      content: 'block+',
      group: 'block',
      defining: true,
      parseDOM: [{ tag: 'blockquote' }],
      toDOM() {
        return ['blockquote', 0]
      }
    },
    embed: {},
    ///
    image: {
      inline: true,
      attrs: {
        src: {},
        alt: { default: null },
        title: { default: null },
        path: { default: null },
        width: { default: null }
      },
      group: 'inline',
      draggable: true,
      parseDOM: [
        {
          tag: 'img[src]',
          getAttrs: (dom: HTMLElement) => ({
            src: dom.getAttribute('src'),
            title: dom.getAttribute('title'),
            alt: dom.getAttribute('alt'),
            path: dom.dataset.path
          })
        }
      ],
      toDOM: (node: Node) => [
        'img',
        {
          src: node.attrs.src,
          title: node.attrs.title,
          alt: node.attrs.alt,
          'data-path': node.attrs.path
        }
      ]
    }
  },
  marks: {
    strong: {
      parseDOM: [
        { tag: 'strong' },
        // This works around a Google Docs misbehavior where
        // pasted content will be inexplicably wrapped in `<b>`
        // tags with a font-weight normal.
        { tag: 'b', getAttrs: (node: HTMLElement) => node.style.fontWeight !== 'normal' && null },
        {
          style: 'font-weight',
          getAttrs: (value: string) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null
        }
      ],
      toDOM() {
        return ['strong', 0]
      }
    },
    em: {
      parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
      toDOM() {
        return ['em', 0]
      }
    },
    link: {
      attrs: {
        href: {},
        title: { default: null }
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs(dom: HTMLElement) {
            return { href: dom.getAttribute('href'), title: dom.getAttribute('title') }
          }
        }
      ],
      toDOM(node) {
        const { href, title } = node.attrs
        return ['a', { href, title }, 0]
      }
    },
    // TODO:
    highlight: {},
    strikethrough: {},
    note: {}
  }
}

export const schema = new Schema(schemaSpec)
