import { Plugin } from 'prosemirror-state'
import { DecorationSet, Decoration } from 'prosemirror-view'
import styles from '../styles/ProseMirror.module.scss'

export const placeholder = (text: string): Plugin =>
  new Plugin({
    props: {
      decorations(state) {
        const { doc } = state

        if (doc.childCount > 1 || !doc.firstChild.isTextblock || doc.firstChild.content.size > 0) {
          return
        }

        const div = document.createElement('div')
        div.setAttribute('contenteditable', 'false')
        div.classList.add(styles.placeholder)
        div.textContent = text

        return DecorationSet.create(doc, [Decoration.widget(1, div)])
      }
    }
  })
