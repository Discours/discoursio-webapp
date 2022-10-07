import { ySyncPlugin, yCursorPlugin, yUndoPlugin } from 'y-prosemirror'
import type { ProseMirrorExtension } from '../state'
import type { YOptions } from '../../store'

export const cursorBuilder = (user: any): HTMLElement => {
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
          // FIXME
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          yCursorPlugin(y.provider.awareness, { cursorBuilder }),
          yUndoPlugin()
        ]
      : prev
})
