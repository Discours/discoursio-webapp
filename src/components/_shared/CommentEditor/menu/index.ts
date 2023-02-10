import { icons, MenuItem, wrapItem } from 'prosemirror-menu'
import { toggleMark } from 'prosemirror-commands'

const markActive = (state, type) => {
  const { from, $from, to, empty } = state.selection

  if (empty) return type.isInSet(state.storedMarks || $from.marks())

  return state.doc.rangeHasMark(from, to, type)
}

const cmdItem = (cmd, options) => {
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

const markItem = (markType, options) => {
  const passedOptions = {
    active(state) {
      return markActive(state, markType)
    },
    enable: true
  }

  for (const prop in options) passedOptions[prop] = options[prop]

  return cmdItem(toggleMark(markType), passedOptions)
}

//TODO: вывести тип для схемы
export const buildMenuItems = (schema) => {
  const toggleStrong = markItem(schema.marks.strong, {
    title: 'Toggle strong style',
    icon: {
      width: 14,
      height: 16,
      path: 'M9.82857 7.76C10.9371 6.99429 11.7143 5.73714 11.7143 4.57143C11.7143 1.98857 9.71428 0 7.14286 0H0V16H8.04571C10.4343 16 12.2857 14.0571 12.2857 11.6686C12.2857 9.93143 11.3029 8.44571 9.82857 7.76ZM3.42799 2.85708H6.85656C7.80513 2.85708 8.57085 3.6228 8.57085 4.57137C8.57085 5.51994 7.80513 6.28565 6.85656 6.28565H3.42799V2.85708ZM3.42799 13.1429H7.42799C8.37656 13.1429 9.14228 12.3772 9.14228 11.4286C9.14228 10.4801 8.37656 9.71434 7.42799 9.71434H3.42799V13.1429Z'
    }
  })

  const toggleEm = markItem(schema.marks.em, {
    title: 'Toggle emphasis',
    icon: {
      width: 14,
      height: 16,
      path: 'M4.39216 0V3.42857H6.81882L3.06353 12.5714H0V16H8.78431V12.5714H6.35765L10.1129 3.42857H13.1765V0H4.39216Z'
    }
  })

  // const toggleLink = linkItem(schema.marks.link)

  // const insertImage = insertImageItem(schema.nodes.image)

  const wrapBlockQuote = wrapItem(schema.nodes.blockquote, {
    title: 'Wrap in block quote',
    icon: icons.blockquote
  })

  const inlineMenu = [toggleStrong, toggleEm, wrapBlockQuote]

  return [inlineMenu]
}
