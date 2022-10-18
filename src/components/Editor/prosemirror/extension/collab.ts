import { ySyncPlugin, yCursorPlugin, yUndoPlugin } from 'y-prosemirror'
import type { YOptions } from '../../store/context'
import type { ProseMirrorExtension } from '../helpers'

export interface EditingProps {
  name: string
  foreground: string
  background: string
}

export const cursorBuilder = (user: EditingProps): HTMLElement => {
  const cursor = document.createElement('span')
  cursor.classList.add('ProseMirror-yjs-cursor')
  cursor.setAttribute('style', `border-color: ${user.background}`)
  const userDiv = document.createElement('span')
  userDiv.setAttribute('style', `background-color: ${user.background}; color: ${user.foreground}`)
  userDiv.textContent = user.name
  cursor.append(userDiv)
  return cursor
}

export default (y: YOptions): ProseMirrorExtension => ({
  plugins: (prev) =>
    y
      ? [
          ...prev,
          ySyncPlugin(y.type),
          yCursorPlugin(y.provider.awareness, { cursorBuilder }),
          yUndoPlugin()
        ]
      : prev
})
