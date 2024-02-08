import { Editor } from '@tiptap/core'

import { UploadedFile } from '../pages/types'
import { hideModal } from '../stores/ui'

export const renderUploadedImage = (editor: Editor, image: UploadedFile) => {
  editor
    .chain()
    .focus()
    .insertContent({
      type: 'figure',
      attrs: { 'data-type': 'image' },
      content: [
        {
          type: 'image',
          attrs: { src: image.url }
        },
        {
          type: 'figcaption',
          content: [{ type: 'text', text: image.originalFilename }]
        }
      ]
    })
    .run()
  hideModal()
}
