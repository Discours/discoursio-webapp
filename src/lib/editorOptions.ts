import { EditorOptions } from '@tiptap/core'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { CustomBlockquote } from '~/components/Editor/extensions/CustomBlockquote'
import { Figcaption } from '~/components/Editor/extensions/Figcaption'
import { Figure } from '~/components/Editor/extensions/Figure'
import { Footnote } from '~/components/Editor/extensions/Footnote'
import { Iframe } from '~/components/Editor/extensions/Iframe'
import { Span } from '~/components/Editor/extensions/Span'
import { ToggleTextWrap } from '~/components/Editor/extensions/ToggleTextWrap'
import { TrailingNode } from '~/components/Editor/extensions/TrailingNode'

// Extend the Figure extension to include Figcaption
const ImageFigure = Figure.extend({
  name: 'capturedImage',
  content: 'figcaption image'
})

export const base: EditorOptions['extensions'] = [
  StarterKit.configure({
    heading: {
      levels: [2, 3, 4]
    },
    horizontalRule: {
      HTMLAttributes: {
        class: 'horizontalRule'
      }
    },
    blockquote: undefined
  }),
  Underline, // не входит в StarterKit
  Link.configure({
    autolink: true,
    openOnClick: false
  }),
  Image,
  Highlight.configure({
    multicolor: true,
    HTMLAttributes: {
      class: 'highlight'
    }
  })
]

export const custom: EditorOptions['extensions'] = [
  ImageFigure,
  Figure,
  Figcaption,
  Footnote,
  CustomBlockquote,
  Iframe,
  Span,
  ToggleTextWrap,
  TrailingNode
  // Добавьте другие кастомные расширения здесь
]

export const collab: EditorOptions['extensions'] = []
/*
  content: '',
  autofocus: false,
  editable: false,
  element: undefined,
  injectCSS: false,
  injectNonce: undefined,
  editorProps: {} as EditorProps,
  parseOptions: {} as EditorOptions['parseOptions'],
  enableInputRules: false,
  enablePasteRules: false,
  enableCoreExtensions: false,
  enableContentCheck: false,
  onBeforeCreate: (_props: EditorEvents['beforeCreate']): void => {
    throw new Error('Function not implemented.')
  },
  onCreate: (_props: EditorEvents['create']): void => {
    throw new Error('Function not implemented.')
  },
  onContentError: (_props: EditorEvents['contentError']): void => {
    throw new Error('Function not implemented.')
  },
  onUpdate: (_props: EditorEvents['update']): void => {
    throw new Error('Function not implemented.')
  },
  onSelectionUpdate: (_props: EditorEvents['selectionUpdate']): void => {
    throw new Error('Function not implemented.')
  },
  onTransaction: (_props: EditorEvents['transaction']): void => {
    throw new Error('Function not implemented.')
  },
  onFocus: (_props: EditorEvents['focus']): void => {
    throw new Error('Function not implemented.')
  },
  onBlur: (_props: EditorEvents['blur']): void => {
    throw new Error('Function not implemented.')
  },
  onDestroy: (_props: EditorEvents['destroy']): void => {
    throw new Error('Function not implemented.')
  }
}
*/
