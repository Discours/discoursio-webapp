import {
  DOMOutputSpec,
  DOMSerializer,
  Node as ProsemirrorNode,
  NodeSpec,
  NodeType,
  Schema
} from 'prosemirror-model'
import type { EditorView } from 'prosemirror-view'
import { wrappingInputRule, inputRules } from 'prosemirror-inputrules'
import { splitListItem } from 'prosemirror-schema-list'
import { keymap } from 'prosemirror-keymap'
import type { NodeViewFn, ProseMirrorExtension } from '../helpers'
import type OrderedMap from 'orderedmap'

const todoListRule = (nodeType: NodeType) =>
  wrappingInputRule(new RegExp('^\\[( |x)]\\s$'), nodeType, (match) => ({
    done: match[1] === 'x'
  }))

const todoListSchema = {
  todo_item: {
    content: 'paragraph+',
    defining: true,
    group: 'block',
    attrs: { done: { default: false } },
    parseDOM: [
      {
        tag: 'div[data-type="todo-item"]',
        getAttrs: (dom: Element) => ({
          done: dom.querySelector('input')?.checked
        })
      }
    ],
    toDOM: (node: ProsemirrorNode) => [
      'div',
      {
        class: `todo-item ${node.attrs.done ? 'done' : ''}`,
        'data-type': 'todo-item'
      },
      [
        'label',
        { contenteditable: false },
        [
          'input',
          {
            type: 'checkbox',
            ...(node.attrs.done ? { checked: 'checked' } : {})
          }
        ]
      ],
      ['div', 0]
    ]
  }
} as NodeSpec

class TodoItemView {
  contentDOM: Node
  dom: Node
  view: EditorView
  getPos: () => number

  constructor(node: ProsemirrorNode, view: EditorView, getPos: () => number) {
    const dom: DOMOutputSpec = node.type.spec.toDOM(node)
    const res = DOMSerializer.renderSpec(document, dom)
    this.dom = res.dom
    this.contentDOM = res.contentDOM
    this.view = view
    this.getPos = getPos
    ;(this.dom as HTMLElement).querySelector('input').addEventListener('click', this.handleClick.bind(this))
  }

  handleClick(e: MouseEvent) {
    const tr = this.view.state.tr
    const elem = e.target as HTMLInputElement
    tr.setNodeMarkup(this.getPos(), null, { done: elem.checked })
    this.view.dispatch(tr)
    this.view.focus()
  }
}

const todoListKeymap = (schema: Schema) => ({
  Enter: splitListItem(schema.nodes.todo_item)
})

export default (): ProseMirrorExtension => ({
  schema: (prev) => ({
    ...prev,
    nodes: (prev.nodes as OrderedMap<NodeSpec>).append(todoListSchema)
  }),
  plugins: (prev, schema) => [
    keymap(todoListKeymap(schema)),
    ...prev,
    inputRules({ rules: [todoListRule(schema.nodes.todo_item)] })
  ],
  nodeViews: {
    todo_item: (node: ProsemirrorNode, view: EditorView, getPos: () => number) => {
      return new TodoItemView(node, view, getPos)
    }
  } as unknown as { [key: string]: NodeViewFn }
})
