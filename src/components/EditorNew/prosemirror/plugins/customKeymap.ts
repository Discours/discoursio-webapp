import { baseKeymap } from 'prosemirror-commands'
import type { Command } from 'prosemirror-state'
import { redo, undo } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'

export const customKeymap = () => {
  const bindings: {
    [key: string]: Command
  } = {
    ...baseKeymap,
    Tab: () => true,
    // TODO: collab
    [`Mod-z`]: undo,
    [`Shift-Mod-z`]: redo
  }

  return keymap(bindings)
}
