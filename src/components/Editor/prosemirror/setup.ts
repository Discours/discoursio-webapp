// import menu from './extension/menu'
// import scroll from './prosemirror/extension/scroll'
import { keymap } from 'prosemirror-keymap'
import type { ProseMirrorExtension } from './helpers'
import { Schema } from 'prosemirror-model'
import { t } from '../../../utils/intl'
import base from './extension/base'
import code from './extension/code'
import dragHandle from './extension/drag-handle'
import image from './extension/image'
import link from './extension/link'
import markdown from './extension/markdown'
import pasteMarkdown from './extension/paste-markdown'
import table from './extension/table'
import collab from './extension/collab'
import type { Config, YOptions } from '../store/context'
import selectionMenu from './extension/selection'
import type { Command } from 'prosemirror-state'
import placeholder from './extension/placeholder'
import todoList from './extension/todo-list'
import strikethrough from './extension/strikethrough'
import scrollPlugin from './extension/scroll'

interface ExtensionsProps {
  data?: unknown
  keymap?: { [key: string]: Command }
  config: Config
  markdown: boolean
  path?: string
  y?: YOptions
  schema?: Schema
  collab?: boolean
  typewriterMode?: boolean
}

const customKeymap = (props: ExtensionsProps): ProseMirrorExtension => ({
  plugins: (prev) => (props.keymap ? [...prev, keymap(props.keymap)] : prev)
})

export const createExtensions = (props: ExtensionsProps): ProseMirrorExtension[] => {
  const eee = [
    placeholder(t('Just start typing...')),
    customKeymap(props),
    base(props.markdown),
    selectionMenu(),
    scrollPlugin(props.config?.typewriterMode)
  ]
  if (props.markdown) {
    eee.push(
      markdown(),
      todoList(),
      dragHandle(),
      code(),
      strikethrough(),
      link(),
      table(),
      image(props.path),
      pasteMarkdown()
      /*
        codeBlock({
          theme: codeTheme(props.config),
          typewriterMode: props.config.typewriterMode,
          fontSize: props.config.fontSize,
          prettier: props.config.prettier,
          extensions: () => [codeMirrorKeymap(props)],
        }),
        */
    )
  }
  if (props.collab) eee.push(collab(props.y))
  return eee
}

export const createEmptyText = () => ({
  doc: {
    type: 'doc',
    content: [{ type: 'paragraph' }]
  },
  selection: {
    type: 'text',
    anchor: 1,
    head: 1
  }
})

export const createSchema = (props: ExtensionsProps) => {
  const extensions = createExtensions({
    config: props.config,
    markdown: props.markdown,
    path: props.path,
    keymap: props.keymap,
    y: props.y
  })

  let schemaSpec = { nodes: {} }
  for (const extension of extensions) {
    if (extension.schema) {
      schemaSpec = extension.schema(schemaSpec)
    }
  }

  return new Schema(schemaSpec)
}
