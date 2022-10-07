import { keymap } from 'prosemirror-keymap'
import type { ProseMirrorExtension } from './state'
import { Schema } from 'prosemirror-model'
import base from './extension/base'
import markdown from './extension/markdown'
import link from './extension/link'
// import scroll from './prosemirror/extension/scroll'
import todoList from './extension/todo-list'
import code from './extension/code'
import strikethrough from './extension/strikethrough'
import placeholder from './extension/placeholder'
// import menu from './extension/menu'
// import image from './extension/image'
import dragHandle from './extension/drag-handle'
import pasteMarkdown from './extension/paste-markdown'
import table from './extension/table'
import collab from './extension/collab'
import type { Config, YOptions } from '../store'
import selectionMenu from './extension/selection'

interface Opts {
  data?: unknown
  keymap?: any
  config: Config
  markdown: boolean
  path?: string
  y?: YOptions
  schema?: Schema
}

const customKeymap = (opts: Opts): ProseMirrorExtension => ({
  plugins: (prev) => (opts.keymap ? [...prev, keymap(opts.keymap)] : prev)
})

/*
const codeMirrorKeymap = (props: Props) => {
  const keys = []
  for (const key in props.keymap) {
    keys.push({key: key, run: props.keymap[key]})
  }

  return cmKeymap.of(keys)
}
*/

export const createExtensions = (opts: Opts): ProseMirrorExtension[] => {
  return opts.markdown
    ? [
        placeholder('Просто начните...'),
        customKeymap(opts),
        base(opts.markdown),
        // scroll(props.config.typewriterMode),
        collab(opts.y),
        dragHandle()
      ]
    : [
        selectionMenu(),
        customKeymap(opts),
        base(opts.markdown),
        collab(opts.y),
        markdown(),
        todoList(),
        dragHandle(),
        code(),
        strikethrough(),
        link(),
        table(),
        // image(props.path), // TODO: image extension
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
      ]
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

export const createSchema = (opts: Opts) => {
  const extensions = createExtensions(opts)

  let schemaSpec = { nodes: {} }

  for (const extension of extensions) {
    if (extension.schema) {
      schemaSpec = extension.schema(schemaSpec)
    }
  }

  return new Schema(schemaSpec)
}
