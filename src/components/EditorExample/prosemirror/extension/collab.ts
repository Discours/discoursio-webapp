import { ySyncPlugin, yCursorPlugin, yUndoPlugin } from 'y-prosemirror'
import type { ProseMirrorExtension } from '../helpers'
import type { YOptions } from '../../store/context'

interface YUser {
  background: string
  foreground: string
  name: string
}

export const cursorBuilder = (user: YUser): HTMLElement => {
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
