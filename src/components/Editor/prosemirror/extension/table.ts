import { EditorState, Selection } from 'prosemirror-state'
import { Node, Schema, ResolvedPos } from 'prosemirror-model'
import { InputRule, inputRules } from 'prosemirror-inputrules'
import { keymap } from 'prosemirror-keymap'
import { ProseMirrorExtension } from '../helpers'

export const tableInputRule = (schema: Schema) =>
  new InputRule(
    new RegExp('^\\|{2,}\\s$'),
    (state: EditorState, match: string[], start: number, end: number) => {
      const tr = state.tr
      const columns = [...Array(match[0].trim().length - 1)]
      const headers = columns.map(() => schema.node(schema.nodes.table_header, {}))
      const cells = columns.map(() => schema.node(schema.nodes.table_cell, {}))
      const table = schema.node(schema.nodes.table, {}, [
        schema.node(schema.nodes.table_head, {}, schema.node(schema.nodes.table_row, {}, headers)),
        schema.node(schema.nodes.table_body, {}, schema.node(schema.nodes.table_row, {}, cells))
      ])

      tr.delete(start - 1, end)
      tr.insert(start - 1, table)
      tr.setSelection(Selection.near(tr.doc.resolve(start + 3)))
      return tr
    }
  )

const tableSchema = {
  table: {
    content: '(table_head | table_body)*',
    isolating: true,
    selectable: false,
    group: 'block',
    parseDOM: [{ tag: 'div[data-type="table"]' }],
    toDOM: () => [
      'div',
      {
        class: 'table-container',
        'data-type': 'table'
      },
      ['table', 0]
    ]
  },
  table_head: {
    content: 'table_row',
    isolating: true,
    group: 'table_block',
    selectable: false,
    parseDOM: [{ tag: 'thead' }],
    toDOM: () => ['thead', 0]
  },
  table_body: {
    content: 'table_row+',
    isolating: true,
    group: 'table_block',
    selectable: false,
    parseDOM: [{ tag: 'tbody' }],
    toDOM: () => ['tbody', 0]
  },
  table_row: {
    content: '(table_cell | table_header)*',
    parseDOM: [{ tag: 'tr' }],
    toDOM: () => ['tr', 0]
  },
  table_cell: {
    content: 'inline*',
    isolating: true,
    group: 'table_block',
    selectable: false,
    attrs: { style: { default: null } },
    parseDOM: [
      {
        tag: 'td',
        getAttrs: (dom: HTMLElement) => {
          const textAlign = dom.style.textAlign
          return textAlign ? { style: `text-align: ${textAlign}` } : null
        }
      }
    ],
    toDOM: (node: Node) => ['td', node.attrs, 0]
  },
  table_header: {
    content: 'inline*',
    isolating: true,
    group: 'table_block',
    selectable: false,
    attrs: { style: { default: null } },
    parseDOM: [
      {
        tag: 'th',
        getAttrs: (dom: HTMLElement) => {
          const textAlign = dom.style.textAlign
          return textAlign ? { style: `text-align: ${textAlign}` } : null
        }
      }
    ],
    toDOM: (node: Node) => ['th', node.attrs, 0]
  }
}

const findParentPos = ($pos: ResolvedPos, fn: (n: Node) => boolean) => {
  for (let d = $pos.depth; d > 0; d--) {
    if (fn($pos.node(d))) return $pos.doc.resolve($pos.before(d + 1))
  }
  return null
}

const findTableCellPos = ($pos: ResolvedPos, header = true) =>
  findParentPos($pos, (n) => n.type.name === 'table_cell' || (header && n.type.name === 'table_header'))

const findTableRowPos = ($pos: ResolvedPos) => findParentPos($pos, (n) => n.type.name === 'table_row')

const findTableHeadPos = ($pos: ResolvedPos) => findParentPos($pos, (n) => n.type.name === 'table_head')

const findTablePos = ($pos: ResolvedPos) => findParentPos($pos, (n) => n.type.name === 'table')

const findNodePosition = (node: Node, fn: (n: Node, p: Node) => boolean) => {
  let result = -1
  node.descendants((n, pos, p) => {
    if (result !== -1) {
      return false
    } else if (fn(n, p)) {
      result = pos
      return false
    }
  })

  return result
}

const findVertTableCellPos = ($pos: ResolvedPos, dir = 'up') => {
  const cellPos = findTableCellPos($pos)
  const rowPos = findTableRowPos($pos)
  const offset = cellPos.pos - ($pos.before() + 1)

  const add = dir === 'up' ? -1 : rowPos.node().nodeSize + 1
  const nodeBeforePos = $pos.doc.resolve(rowPos.before() + add)
  let rowBeforePos = findTableRowPos(nodeBeforePos)

  if (!rowBeforePos) {
    const table = $pos.node(0)
    const tablePos = findTablePos($pos)
    const inTableHead = !!findTableHeadPos($pos)

    if (dir === 'up' && inTableHead) {
      return $pos.doc.resolve(Math.max(0, tablePos.before() - 1))
    } else if (dir === 'down' && !inTableHead) {
      return $pos.doc.resolve(tablePos.after())
    }

    const pos = findNodePosition(table, (n, p) => {
      return inTableHead
        ? p.type.name === 'table_body' && n.type.name === 'table_row'
        : p.type.name === 'table_head' && n.type.name === 'table_row'
    })

    rowBeforePos = $pos.doc.resolve(pos + 1)
  }

  const targetCell = $pos.doc.resolve(rowBeforePos.posAtIndex(rowPos.index()) + 1)
  const targetCellTextSize = getTextSize(targetCell.node())
  const cellOffset = offset > targetCellTextSize ? targetCellTextSize : offset
  return $pos.doc.resolve(targetCell.pos + cellOffset)
}

const getTextSize = (n: Node) => {
  let size = 0
  n.descendants((d: Node) => {
    size += d.text?.length ?? 0
  })

  return size
}

export default (): ProseMirrorExtension => ({
  schema: (prev) => ({
    ...prev,
    nodes: (prev.nodes as any).append(tableSchema)
  }),
  plugins: (prev, schema) => [
    keymap({
      'Ctrl-Enter': (state, dispatch) => {
        const tablePos = findTablePos(state.selection.$head)
        if (!tablePos) return false
        const targetPos = tablePos.after()
        const tr = state.tr
        tr.insert(targetPos, state.schema.node('paragraph'))
        tr.setSelection(Selection.near(tr.doc.resolve(targetPos)))
        dispatch(tr)
        return true
      },
      Backspace: (state, dispatch) => {
        const sel = state.selection
        if (!sel.empty) return false
        const cellPos = findTableCellPos(sel.$head)
        if (!cellPos) return false

        if (getTextSize(cellPos.node()) === 0) {
          const rowPos = findTableRowPos(sel.$head)
          const tablePos = findTablePos(sel.$head)
          const before = state.doc.resolve(cellPos.before() - 1)

          const cellBeforePos = findTableCellPos(before)
          const inTableHead = !!findTableHeadPos(sel.$head)

          if (cellBeforePos) {
            const tr = state.tr
            tr.setSelection(Selection.near(before))
            dispatch(tr)
            return true
          } else if (!inTableHead && getTextSize(rowPos.node()) === 0) {
            const tr = state.tr
            tr.delete(before.pos - 1, before.pos + rowPos.node().nodeSize)
            tr.setSelection(Selection.near(tr.doc.resolve(before.pos - 4)))
            dispatch(tr)
            return true
          } else if (getTextSize(tablePos.node()) === 0) {
            const tr = state.tr
            tr.delete(tablePos.before(), tablePos.before() + tablePos.node().nodeSize)
            dispatch(tr)
            return true
          }
        }

        return false
      },
      Enter: (state, dispatch) => {
        const sel = state.selection
        if (!sel.empty) return false
        const cellPos = findTableCellPos(sel.$head)
        if (!cellPos) return false

        const rowPos = findTableRowPos(sel.$head)
        const cells = []
        rowPos.node().forEach((cell) => {
          cells.push(schema.nodes.table_cell.create(cell.attrs))
        })
        const newRow = schema.nodes.table_row.create(null, cells)

        const theadPos = findTableHeadPos(sel.$head)
        if (theadPos) {
          const tablePos = findTablePos(sel.$head)
          let tbodyPos: number
          tablePos.node().descendants((node, pos) => {
            if (node.type.name === 'table_body') {
              tbodyPos = tablePos.pos + pos
            }
          })

          if (tbodyPos) {
            const tbody = state.doc.resolve(tbodyPos + 1)
            const tr = state.tr.insert(tbody.pos, newRow)
            tr.setSelection(Selection.near(tr.doc.resolve(tbody.pos)))
            dispatch(tr)
          } else {
            const tbody = schema.nodes.table_body.create(null, [newRow])
            const targetPos = theadPos.after()
            const tr = state.tr.insert(targetPos, tbody)
            tr.setSelection(Selection.near(tr.doc.resolve(targetPos)))
            dispatch(tr)
          }

          return true
        }

        const targetPos = sel.$head.after(-1)
        const tr = state.tr.insert(targetPos, newRow)
        tr.setSelection(Selection.near(tr.doc.resolve(targetPos)))

        dispatch(tr)
        return true
      },
      ArrowUp: (state, dispatch) => {
        const sel = state.selection
        if (!sel.empty) return false
        const cellPos = findTableCellPos(sel.$head)
        if (!cellPos) return false
        const abovePos = findVertTableCellPos(sel.$head)
        if (abovePos) {
          const tr = state.tr
          let selection = Selection.near(abovePos)
          if (abovePos.pos === 0 && cellPos.parentOffset === 0) {
            tr.insert(0, state.schema.node('paragraph'))
            selection = Selection.near(tr.doc.resolve(0))
          }
          tr.setSelection(selection)
          dispatch(tr)
          return true
        }

        return false
      },
      ArrowDown: (state, dispatch) => {
        const sel = state.selection
        if (!sel.empty) return false
        const cellPos = findTableCellPos(sel.$head)
        if (!cellPos) return false
        const belowPos = findVertTableCellPos(sel.$head, 'down')
        if (belowPos) {
          const tr = state.tr
          tr.setSelection(Selection.near(belowPos))
          dispatch(tr)
          return true
        }

        return false
      }
    }),
    ...prev,
    inputRules({ rules: [tableInputRule(schema)] })
  ]
})
