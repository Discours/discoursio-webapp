import { Plugin } from 'prosemirror-state'
import { DecorationSet, Decoration } from 'prosemirror-view'
import { ProseMirrorExtension, isEmpty } from '../state'

const placeholder = (text: string) =>
  new Plugin({
    props: {
      decorations(state) {
        if (isEmpty(state)) {
          const div = document.createElement('div')

          div.setAttribute('contenteditable', 'false')
          div.classList.add('placeholder')
          div.textContent = text

          return DecorationSet.create(state.doc, [Decoration.widget(1, div)])
        }
      }
    }
  })

export default (text: string): ProseMirrorExtension => ({
  plugins: (prev) => [...prev, placeholder(text)]
})
