import { UploadedFile } from '../pages/types'
import { hideModal } from '../stores/ui'
import { Editor } from '@tiptap/core'

export const renderUploadedImage = (editor: Editor, image: UploadedFile) => {
  editor
    .chain()
    .focus()
    .insertContent({
      type: 'capturedImage',
      content: [
        {
          type: 'figcaption',
          content: [
            {
              type: 'text',
              text: image.originalFilename ?? '',
            },
          ],
        },
        {
          type: 'image',
          attrs: {
            src: image.url,
          },
        },
      ],
    })
    .run()
  hideModal()
}
