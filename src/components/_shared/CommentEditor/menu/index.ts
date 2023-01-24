import { blockTypeItem, icons, MenuItem, wrapItem } from 'prosemirror-menu'
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
      width: 13,
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

  // const headingIcons = [
  //   'M0 12H2.57143V7.16571H7.95429V12H10.5257V0H7.95429V4.83429H2.57143V0H0V12Z M12.6801 12H19.3315V9.78857H17.3944V0.342858H15.5087L12.6801 1.42286V3.75429L14.8744 2.93143V9.78857H12.6801V12Z',
  //   'M0 12H2.57143V7.16571H7.95429V12H10.5257V0H7.95429V4.83429H2.57143V0H0V12Z M12.4915 12H21.2515V9.78857H15.4229C15.4229 9.05143 16.6229 8.43429 17.9944 7.59429C19.5372 6.68571 21.1658 5.52 21.1658 3.54857C21.1658 1.16571 19.2458 0.102858 16.8972 0.102858C15.4744 0.102858 14.0858 0.48 12.8858 1.33714V3.73714C14.1201 2.79429 15.4915 2.36571 16.6744 2.36571C17.8229 2.36571 18.5772 2.79429 18.5772 3.65143C18.5772 4.76571 17.5487 5.22857 16.3315 5.93143C14.6172 6.94286 12.4915 8.02286 12.4915 10.8514V12Z',
  //   'M0 11.7647H2.52101V7.02521H7.79832V11.7647H10.3193V0H7.79832V4.7395H2.52101V0H0V11.7647Z M16.3474 12C18.7004 12 20.9189 11.042 20.9189 8.63866C20.9189 6.95798 19.8936 6.06723 18.7172 5.71429C19.7928 5.34454 20.4483 4.43697 20.4483 3.2605C20.4483 1.17647 18.6836 0.100841 16.3138 0.100841C14.9189 0.100841 13.6079 0.436975 12.5827 0.991597V3.34454C13.7088 2.63865 14.9357 2.31933 15.9609 2.31933C17.339 2.31933 18.0617 2.78992 18.0617 3.61345C18.0617 4.40336 17.3558 4.82353 16.2466 4.80672L14.6668 4.78992L14.6499 6.97479H16.5323C17.6752 6.97479 18.5155 7.31092 18.5155 8.28571C18.5155 9.36134 17.4399 9.7647 16.1457 9.78151C14.8348 9.79832 13.692 9.59664 12.381 8.87395V11.2269C13.692 11.7647 14.8852 12 16.3474 12Z'
  // ]

  // 3 is the max heading level mb move to constant
  // const headings: MenuItem[] = []
  //
  // for (let i = 0; i < 3; i++) {
  //   headings.push(
  //     blockTypeItem(schema.nodes.heading, {
  //       label: `H${i + 1}`,
  //       attrs: { level: i + 1 },
  //       icon: {
  //         width: 22,
  //         height: 12,
  //         path: headingIcons[i]
  //       }
  //     })
  //   )
  // }

  const inlineMenu = [toggleStrong, toggleEm, wrapBlockQuote]

  return [inlineMenu]
}
