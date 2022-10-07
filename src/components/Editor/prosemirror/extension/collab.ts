import { ySyncPlugin, yCursorPlugin, yUndoPlugin } from 'y-prosemirror'
import type { ProseMirrorExtension } from '../state'
import type { PeerData } from '../context'

export const cursorBuilder = (user: {
  name: string
  foreground: string
  background: string
}): HTMLElement => {
  const cursor = document.createElement('span')
  const userDiv = document.createElement('span')
  cursor.classList.add('ProseMirror-yjs-cursor')
  cursor.setAttribute('style', `border-color: ${user.background}`)
  userDiv.setAttribute('style', `background-color: ${user.background}; color: ${user.foreground}`)
  userDiv.textContent = user.name
  cursor.append(userDiv)
  return cursor
}

export default (y: PeerData): ProseMirrorExtension => ({
  plugins: (prev) =>
    y
      ? [
          ...prev,
          ySyncPlugin(y.payload),
          yCursorPlugin(y.provider.awareness, { cursorBuilder }),
          yUndoPlugin()
        ]
      : prev
})
