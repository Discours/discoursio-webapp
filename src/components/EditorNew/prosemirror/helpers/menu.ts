import { toggleMark } from 'prosemirror-commands'
import { wrapInList } from 'prosemirror-schema-list'
import { blockTypeItem, icons, MenuItem, wrapItem, Dropdown } from 'prosemirror-menu'

import type { NodeSelection } from 'prosemirror-state'

import { TextField, openPrompt } from './prompt'

import type { DiscoursSchema } from '../schema'

function wrapListItem(nodeType, options) {
  return cmdItem(wrapInList(nodeType, options.attrs), options)
}

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
      const {
        from,
        to,
        node: { attrs }
      } = state.selection as NodeSelection

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
        onSubmit(newAttrs) {
          view.dispatch(view.state.tr.replaceSelectionWith(nodeType.createAndFill(newAttrs)))
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

  if ((!options.enable || options.enable === true) && !options.select) {
    passedOptions[options.enable ? 'enable' : 'select'] = (state) => cmd(state)
  }

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
          })
        },
        onSubmit(attrs) {
          toggleMark(markType, attrs)(view.state, view.dispatch)
          view.focus()
        }
      })
    }
  })
}

export const buildMenuItems = (schema: DiscoursSchema) => {
  const toggleStrong = markItem(schema.marks.strong, {
    title: 'Toggle strong style',
    icon: {
      width: 14,
      height: 16,
      path: 'M 10.1573,7.43667 C 11.2197,6.70286 11.9645,5.49809 11.9645,4.38095 11.9645,1.90571 10.0478,0 7.58352,0 H 0.738281 V 15.3333 H 8.44876 c 2.28904,0 4.06334,-1.8619 4.06334,-4.1509 0,-1.66478 -0.9419,-3.08859 -2.3548,-3.74573 z M 4.02344,2.73828 h 3.28571 c 0.90905,0 1.64286,0.73381 1.64286,1.64286 0,0.90905 -0.73381,1.64286 -1.64286,1.64286 H 4.02344 Z M 4.01629,9.3405869 h 3.87946 c 0.9090501,0 1.6428601,0.7338101 1.6428601,1.6428601 0,0.90905 -0.73381,1.64286 -1.6428601,1.64286 H 4.01629 Z'
    }
  })

  const toggleEm = markItem(schema.marks.em, {
    title: 'Toggle emphasis',
    icon: {
      width: 11,
      height: 16,
      path: 'M4.39216 0V3.42857H6.81882L3.06353 12.5714H0V16H8.78431V12.5714H6.35765L10.1129 3.42857H13.1765V0H4.39216Z'
    }
  })

  const toggleLink = linkItem(schema.marks.link)

  const insertImage = insertImageItem(schema.nodes.image)

  const wrapBlockQuote = wrapItem(schema.nodes.blockquote, {
    title: 'Wrap in block quote',
    icon: icons.blockquote
  })

  const headingIcons = [
    'M0 12H2.57143V7.16571H7.95429V12H10.5257V0H7.95429V4.83429H2.57143V0H0V12Z M12.6801 12H19.3315V9.78857H17.3944V0.342858H15.5087L12.6801 1.42286V3.75429L14.8744 2.93143V9.78857H12.6801V12Z',
    'M0 12H2.57143V7.16571H7.95429V12H10.5257V0H7.95429V4.83429H2.57143V0H0V12Z M12.4915 12H21.2515V9.78857H15.4229C15.4229 9.05143 16.6229 8.43429 17.9944 7.59429C19.5372 6.68571 21.1658 5.52 21.1658 3.54857C21.1658 1.16571 19.2458 0.102858 16.8972 0.102858C15.4744 0.102858 14.0858 0.48 12.8858 1.33714V3.73714C14.1201 2.79429 15.4915 2.36571 16.6744 2.36571C17.8229 2.36571 18.5772 2.79429 18.5772 3.65143C18.5772 4.76571 17.5487 5.22857 16.3315 5.93143C14.6172 6.94286 12.4915 8.02286 12.4915 10.8514V12Z',
    'M0 11.7647H2.52101V7.02521H7.79832V11.7647H10.3193V0H7.79832V4.7395H2.52101V0H0V11.7647Z M16.3474 12C18.7004 12 20.9189 11.042 20.9189 8.63866C20.9189 6.95798 19.8936 6.06723 18.7172 5.71429C19.7928 5.34454 20.4483 4.43697 20.4483 3.2605C20.4483 1.17647 18.6836 0.100841 16.3138 0.100841C14.9189 0.100841 13.6079 0.436975 12.5827 0.991597V3.34454C13.7088 2.63865 14.9357 2.31933 15.9609 2.31933C17.339 2.31933 18.0617 2.78992 18.0617 3.61345C18.0617 4.40336 17.3558 4.82353 16.2466 4.80672L14.6668 4.78992L14.6499 6.97479H16.5323C17.6752 6.97479 18.5155 7.31092 18.5155 8.28571C18.5155 9.36134 17.4399 9.7647 16.1457 9.78151C14.8348 9.79832 13.692 9.59664 12.381 8.87395V11.2269C13.692 11.7647 14.8852 12 16.3474 12Z'
  ]

  // 3 is the max heading level mb move to constant
  const headings: MenuItem[] = []

  for (let i = 0; i < 3; i++) {
    headings.push(
      blockTypeItem(schema.nodes.heading, {
        label: `H${i + 1}`,
        attrs: { level: i + 1 },
        icon: {
          width: 22,
          height: 12,
          path: headingIcons[i]
        }
      })
    )
  }

  const typeMenu = new Dropdown([...headings, wrapBlockQuote], {
    label: 'Тт',
    class: 'editor-dropdown'
  })

  const wrapBulletList = wrapListItem(schema.nodes.bullet_list, {
    title: 'Wrap in bullet list',
    icon: {
      width: 20,
      height: 16,
      path: 'M0.000114441 1.6C0.000114441 0.714665 0.71478 0 1.60011 0C2.48544 0 3.20011 0.714665 3.20011 1.6C3.20011 2.48533 2.48544 3.19999 1.60011 3.19999C0.71478 3.19999 0.000114441 2.48533 0.000114441 1.6ZM0 8.00013C0 7.1148 0.714665 6.40014 1.6 6.40014C2.48533 6.40014 3.19999 7.1148 3.19999 8.00013C3.19999 8.88547 2.48533 9.60013 1.6 9.60013C0.714665 9.60013 0 8.88547 0 8.00013ZM1.6 12.8C0.714665 12.8 0 13.5254 0 14.4C0 15.2747 0.725332 16 1.6 16C2.47466 16 3.19999 15.2747 3.19999 14.4C3.19999 13.5254 2.48533 12.8 1.6 12.8ZM19.7333 15.4662H4.79999V13.3329H19.7333V15.4662ZM4.79999 9.06677H19.7333V6.93344H4.79999V9.06677ZM4.79999 2.66664V0.533307H19.7333V2.66664H4.79999Z'
    }
  })

  const wrapOrderedList = wrapListItem(schema.nodes.ordered_list, {
    title: 'Wrap in ordered list',
    icon: {
      width: 19,
      height: 16,
      path: 'M2.00002 4.00003H1.00001V1.00001H0V0H2.00002V4.00003ZM2.00002 13.5V13H0V12H3.00003V16H0V15H2.00002V14.5H1.00001V13.5H2.00002ZM0 6.99998H1.80002L0 9.1V10H3.00003V9H1.20001L3.00003 6.89998V5.99998H0V6.99998ZM4.9987 2.99967V0.999648H18.9988V2.99967H4.9987ZM4.9987 15.0001H18.9988V13.0001H4.9987V15.0001ZM18.9988 8.99987H4.9987V6.99986H18.9988V8.99987Z'
    }
  })

  const listMenu = [wrapBulletList, wrapOrderedList]
  const inlineMenu = [toggleStrong, toggleEm]

  return [[typeMenu, ...inlineMenu, toggleLink, insertImage, ...listMenu]]
}
