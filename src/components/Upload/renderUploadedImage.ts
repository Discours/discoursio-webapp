import { Editor } from '@tiptap/core'

export const renderUploadedImage = (editor: Editor, image: { url: string; originalFilename?: string }) => {
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
}

export const allowedImageTypes = new Set([
  'image/bmp',
  'image/gif',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/tiff',
  'image/webp',
  'image/x-icon'
])
