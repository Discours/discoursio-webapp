import { toggleMark } from 'prosemirror-commands'
import {
  blockTypeItem,
  // joinUpItem,
  // liftItem,
  // selectParentNodeItem,
  // undoItem,
  // redoItem,
  menuBar,
  icons,
  MenuItem,
  wrapItem,
  Dropdown
} from 'prosemirror-menu'

import { wrapInList } from 'prosemirror-schema-list'
import { NodeSelection } from 'prosemirror-state'

import { TextField, openPrompt } from './prompt'
import { ProseMirrorExtension } from '../helpers'

// Helpers to create specific types of items

function canInsert(state, nodeType) {
  const $from = state.selection.$from

  for (let d = $from.depth; d >= 0; d--) {
    const index = $from.index(d)

    if ($from.node(d).canReplaceWith(index, index, nodeType)) return true
  }

  return false
}

function insertImageItem(nodeType) {
  return new MenuItem({
    icon: icons.image,
    label: 'image',
    enable(state) {
      return canInsert(state, nodeType)
    },
    run(state, _, view) {
      const { from, to } = state.selection
      let attrs = null

      if (state.selection instanceof NodeSelection && state.selection.node.type == nodeType) { attrs = state.selection.node.attrs }

      openPrompt({
        title: 'Insert image',
        fields: {
          src: new TextField({
            label: 'Location',
            required: true,
            value: attrs && attrs.src
          }),
          title: new TextField({ label: 'Title', value: attrs && attrs.title }),
          alt: new TextField({
            label: 'Description',
            value: attrs ? attrs.alt : state.doc.textBetween(from, to, ' ')
          })
        },
        callback(attrs) {
          view.dispatch(view.state.tr.replaceSelectionWith(nodeType.createAndFill(attrs)))
          view.focus()
        }
      })
    }
  })
}

function cmdItem(cmd, options) {
  const passedOptions = {
    label: options.title,
    run: cmd
  }

  for (const prop in options) passedOptions[prop] = options[prop]

  if ((!options.enable || options.enable === true) && !options.select) { passedOptions[options.enable ? 'enable' : 'select'] = (state) => cmd(state) }

  return new MenuItem(passedOptions)
}

function markActive(state, type) {
  const { from, $from, to, empty } = state.selection

  if (empty) return type.isInSet(state.storedMarks || $from.marks())

  return state.doc.rangeHasMark(from, to, type)
}

function markItem(markType, options) {
  const passedOptions = {
    active(state) {
      return markActive(state, markType)
    },
    enable: true
  }

  for (const prop in options) passedOptions[prop] = options[prop]

  return cmdItem(toggleMark(markType), passedOptions)
}

function linkItem(markType) {
  return new MenuItem({
    title: 'Add or remove link',
    icon: {
      width: 18,
      height: 18,
      path: 'M3.27177 14.7277C2.06258 13.5186 2.06258 11.5527 3.27177 10.3435L6.10029 7.51502L4.75675 6.17148L1.92823 9C-0.0234511 10.9517 -0.0234511 14.1196 1.92823 16.0713C3.87991 18.023 7.04785 18.023 8.99952 16.0713L11.828 13.2428L10.4845 11.8992L7.65598 14.7277C6.44679 15.9369 4.48097 15.9369 3.27177 14.7277ZM6.87756 12.536L12.5346 6.87895L11.1203 5.46469L5.4633 11.1217L6.87756 12.536ZM6.17055 4.75768L8.99907 1.92916C10.9507 -0.0225206 14.1187 -0.0225201 16.0704 1.92916C18.022 3.88084 18.022 7.04878 16.0704 9.00046L13.2418 11.829L11.8983 10.4854L14.7268 7.65691C15.936 6.44772 15.936 4.4819 14.7268 3.27271C13.5176 2.06351 11.5518 2.06351 10.3426 3.2727L7.51409 6.10122L6.17055 4.75768Z'
    },
    active(state) {
      return markActive(state, markType)
    },
    enable(state) {
      return !state.selection.empty
    },
    run(state, dispatch, view) {
      if (markActive(state, markType)) {
        toggleMark(markType)(state, dispatch)

        return true
      }

      openPrompt({
        fields: {
          href: new TextField({
            label: 'Link target',
            required: true
          }),
        },
        callback(attrs) {
          toggleMark(markType, attrs)(view.state, view.dispatch)
          view.focus()
        }
      })
    }
  })
}

function wrapListItem(nodeType, options) {
  return cmdItem(wrapInList(nodeType, options.attrs), options)
}

// :: (Schema) → Object
// Given a schema, look for default mark and node types in it and
// return an object with relevant menu items relating to those marks:
//
// **`toggleStrong`**`: MenuItem`
//   : A menu item to toggle the [strong mark](#schema-basic.StrongMark).
//
// **`toggleEm`**`: MenuItem`
//   : A menu item to toggle the [emphasis mark](#schema-basic.EmMark).
//
// **`toggleCode`**`: MenuItem`
//   : A menu item to toggle the [code font mark](#schema-basic.CodeMark).
//
// **`toggleLink`**`: MenuItem`
//   : A menu item to toggle the [link mark](#schema-basic.LinkMark).
//
// **`insertImage`**`: MenuItem`
//   : A menu item to insert an [image](#schema-basic.Image).
//
// **`wrapBulletList`**`: MenuItem`
//   : A menu item to wrap the selection in a [bullet list](#schema-list.BulletList).
//
// **`wrapOrderedList`**`: MenuItem`
//   : A menu item to wrap the selection in an [ordered list](#schema-list.OrderedList).
//
// **`wrapBlockQuote`**`: MenuItem`
//   : A menu item to wrap the selection in a [block quote](#schema-basic.BlockQuote).
//
// **`makeParagraph`**`: MenuItem`
//   : A menu item to set the current textblock to be a normal
//     [paragraph](#schema-basic.Paragraph).
//
// **`makeCodeBlock`**`: MenuItem`
//   : A menu item to set the current textblock to be a
//     [code block](#schema-basic.CodeBlock).
//
// **`makeHead[N]`**`: MenuItem`
//   : Where _N_ is 1 to 6. Menu items to set the current textblock to
//     be a [heading](#schema-basic.Heading) of level _N_.
//
// **`insertHorizontalRule`**`: MenuItem`
//   : A menu item to insert a horizontal rule.
//
// The return value also contains some prefabricated menu elements and
// menus, that you can use instead of composing your own menu from
// scratch:
//
// **`insertMenu`**`: Dropdown`
//   : A dropdown containing the `insertImage` and
//     `insertHorizontalRule` items.
//
// **`typeMenu`**`: Dropdown`
//   : A dropdown containing the items for making the current
//     textblock a paragraph, code block, or heading.
//
// **`fullMenu`**`: [[MenuElement]]`
//   : An array of arrays of menu elements for use as the full menu
//     for, for example the [menu bar](https://github.com/prosemirror/prosemirror-menu#user-content-menubar).
export function buildMenuItems(schema) {
  const r: { [key: string]: MenuItem | MenuItem[] } = {}
  let type

  if ((type = schema.marks.strong)) {
    r.toggleStrong = markItem(type, {
      title: 'Toggle strong style',
      icon: {
        width: 13,
        height: 16,
        path: "M9.82857 7.76C10.9371 6.99429 11.7143 5.73714 11.7143 4.57143C11.7143 1.98857 9.71428 0 7.14286 0H0V16H8.04571C10.4343 16 12.2857 14.0571 12.2857 11.6686C12.2857 9.93143 11.3029 8.44571 9.82857 7.76ZM3.42799 2.85708H6.85656C7.80513 2.85708 8.57085 3.6228 8.57085 4.57137C8.57085 5.51994 7.80513 6.28565 6.85656 6.28565H3.42799V2.85708ZM3.42799 13.1429H7.42799C8.37656 13.1429 9.14228 12.3772 9.14228 11.4286C9.14228 10.4801 8.37656 9.71434 7.42799 9.71434H3.42799V13.1429Z"
      }
    })
  }

  if ((type = schema.marks.em)) {
    r.toggleEm = markItem(type, {
      title: 'Toggle emphasis',
      icon: {
        width: 14,
        height: 16,
        path: "M4.39216 0V3.42857H6.81882L3.06353 12.5714H0V16H8.78431V12.5714H6.35765L10.1129 3.42857H13.1765V0H4.39216Z"
      }
    })
  }

  if ((type = schema.marks.code)) {
    r.toggleCode = markItem(type, {
      title: 'Toggle code font',
      icon: icons.code
    })
  }

  if ((type = schema.marks.link)) r.toggleLink = linkItem(type)

  if ((type = schema.marks.blockquote)) { if ((type = schema.nodes.image)) r.insertImage = insertImageItem(type) }

  if ((type = schema.nodes.bullet_list)) {
    r.wrapBulletList = wrapListItem(type, {
      title: 'Wrap in bullet list',
      icon: {
        width: 20,
        height: 16,
        path: 'M0.000114441 1.6C0.000114441 0.714665 0.71478 0 1.60011 0C2.48544 0 3.20011 0.714665 3.20011 1.6C3.20011 2.48533 2.48544 3.19999 1.60011 3.19999C0.71478 3.19999 0.000114441 2.48533 0.000114441 1.6ZM0 8.00013C0 7.1148 0.714665 6.40014 1.6 6.40014C2.48533 6.40014 3.19999 7.1148 3.19999 8.00013C3.19999 8.88547 2.48533 9.60013 1.6 9.60013C0.714665 9.60013 0 8.88547 0 8.00013ZM1.6 12.8C0.714665 12.8 0 13.5254 0 14.4C0 15.2747 0.725332 16 1.6 16C2.47466 16 3.19999 15.2747 3.19999 14.4C3.19999 13.5254 2.48533 12.8 1.6 12.8ZM19.7333 15.4662H4.79999V13.3329H19.7333V15.4662ZM4.79999 9.06677H19.7333V6.93344H4.79999V9.06677ZM4.79999 2.66664V0.533307H19.7333V2.66664H4.79999Z'
      }
    })
  }

  if ((type = schema.nodes.ordered_list)) {
    r.wrapOrderedList = wrapListItem(type, {
      title: 'Wrap in ordered list',
      icon: {
        width: 19,
        height: 16,
        path: 'M2.00002 4.00003H1.00001V1.00001H0V0H2.00002V4.00003ZM2.00002 13.5V13H0V12H3.00003V16H0V15H2.00002V14.5H1.00001V13.5H2.00002ZM0 6.99998H1.80002L0 9.1V10H3.00003V9H1.20001L3.00003 6.89998V5.99998H0V6.99998ZM4.9987 2.99967V0.999648H18.9988V2.99967H4.9987ZM4.9987 15.0001H18.9988V13.0001H4.9987V15.0001ZM18.9988 8.99987H4.9987V6.99986H18.9988V8.99987Z'
      }
    })
  }

  if ((type = schema.nodes.blockquote)) {
    r.wrapBlockQuote = wrapItem(type, {
      title: 'Wrap in block quote',
      icon: icons.blockquote
    })
  }

  if ((type = schema.nodes.paragraph)) {
    r.makeParagraph = blockTypeItem(type, {
      title: 'Change to paragraph',
      label: 'P',
      icon: icons.paragraph
    })
  }

  if ((type = schema.nodes.code_block)) {
    r.makeCodeBlock = blockTypeItem(type, {
      title: 'Change to code block',
      label: '<>'
    })
  }

  const headingIcons = [
    'M0 12H2.57143V7.16571H7.95429V12H10.5257V0H7.95429V4.83429H2.57143V0H0V12Z M12.6801 12H19.3315V9.78857H17.3944V0.342858H15.5087L12.6801 1.42286V3.75429L14.8744 2.93143V9.78857H12.6801V12Z',
    'M0 12H2.57143V7.16571H7.95429V12H10.5257V0H7.95429V4.83429H2.57143V0H0V12Z M12.4915 12H21.2515V9.78857H15.4229C15.4229 9.05143 16.6229 8.43429 17.9944 7.59429C19.5372 6.68571 21.1658 5.52 21.1658 3.54857C21.1658 1.16571 19.2458 0.102858 16.8972 0.102858C15.4744 0.102858 14.0858 0.48 12.8858 1.33714V3.73714C14.1201 2.79429 15.4915 2.36571 16.6744 2.36571C17.8229 2.36571 18.5772 2.79429 18.5772 3.65143C18.5772 4.76571 17.5487 5.22857 16.3315 5.93143C14.6172 6.94286 12.4915 8.02286 12.4915 10.8514V12Z',
    'M0 11.7647H2.52101V7.02521H7.79832V11.7647H10.3193V0H7.79832V4.7395H2.52101V0H0V11.7647Z M16.3474 12C18.7004 12 20.9189 11.042 20.9189 8.63866C20.9189 6.95798 19.8936 6.06723 18.7172 5.71429C19.7928 5.34454 20.4483 4.43697 20.4483 3.2605C20.4483 1.17647 18.6836 0.100841 16.3138 0.100841C14.9189 0.100841 13.6079 0.436975 12.5827 0.991597V3.34454C13.7088 2.63865 14.9357 2.31933 15.9609 2.31933C17.339 2.31933 18.0617 2.78992 18.0617 3.61345C18.0617 4.40336 17.3558 4.82353 16.2466 4.80672L14.6668 4.78992L14.6499 6.97479H16.5323C17.6752 6.97479 18.5155 7.31092 18.5155 8.28571C18.5155 9.36134 17.4399 9.7647 16.1457 9.78151C14.8348 9.79832 13.692 9.59664 12.381 8.87395V11.2269C13.692 11.7647 14.8852 12 16.3474 12Z'
  ]

  if ((type = schema.nodes.heading)) {
    for (let i = 1; i <= 10; i++) {
      r[`makeHead${i}`] = blockTypeItem(type, {
        label: `H${i}`,
        attrs: { level: i },
        icon: {
          width: 22,
          height: 12,
          path: headingIcons[i - 1]
        }
      })
    }
  }

  if ((type = schema.nodes.horizontal_rule)) {
    const hr = type

    r.insertHorizontalRule = new MenuItem({
      label: '---',
      icon: icons.horizontal_rule,
      enable(state) {
        return canInsert(state, hr)
      },
      run(state, dispatch) {
        dispatch(state.tr.replaceSelectionWith(hr.create()))
      }
    })
  }

  const cut = (arr) => arr.filter((x) => x)
  r.typeMenu = new Dropdown(
    cut([r.makeHead1, r.makeHead2, r.makeHead3, r.typeMenu, r.wrapBlockQuote]),
    { label: 'Тт', icon: {
      width: 12,
      height: 12,
      path: "M6.39999 3.19998V0H20.2666V3.19998H14.9333V15.9999H11.7333V3.19998H6.39999ZM3.19998 8.5334H0V5.33342H9.59994V8.5334H6.39996V16H3.19998V8.5334Z"
    } })
  // r.blockMenu = []
  r.listMenu = [cut([r.wrapBulletList, r.wrapOrderedList])]
  r.inlineMenu = [cut([r.toggleStrong, r.toggleEm, r.toggleMark])]
  r.fullMenu = r.inlineMenu.concat([cut([r.typeMenu])], r.listMenu)

  return r
}

export default (): ProseMirrorExtension => ({
  plugins: (prev, schema) => [
    ...prev,
    menuBar({
      floating: false,
      content: buildMenuItems(schema).fullMenu
    })
  ]
})
