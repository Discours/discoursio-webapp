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
      path: 'M 10.1573,7.43667 C 11.2197,6.70286 11.9645,5.49809 11.9645,4.38095 11.9645,1.90571 10.0478,0 7.58352,0 H 0.738281 V 15.3333 H 8.44876 c 2.28904,0 4.06334,-1.8619 4.06334,-4.1509 0,-1.66478 -0.9419,-3.08859 -2.3548,-3.74573 z M 4.02344,2.73828 h 3.28571 c 0.90905,0 1.64286,0.73381 1.64286,1.64286 0,0.90905 -0.73381,1.64286 -1.64286,1.64286 H 4.02344 Z M 4.01629,9.3405869 h 3.87946 c 0.9090501,0 1.6428601,0.7338101 1.6428601,1.6428601 0,0.90905 -0.73381,1.64286 -1.6428601,1.64286 H 4.01629 Z'
    }
  })

  const toggleEm = markItem(schema.marks.em, {
    title: 'Toggle emphasis',
    icon: {
      width: 13,
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
