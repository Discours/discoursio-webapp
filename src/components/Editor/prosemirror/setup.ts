import { keymap } from 'prosemirror-keymap'
import { ProseMirrorExtension } from './helpers'
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
import image from './extension/image'
import dragHandle from './extension/drag-handle'
import pasteMarkdown from './extension/paste-markdown'
import table from './extension/table'
import collab from './extension/collab'
import { Config, YOptions } from '../store/context'
import selectionMenu from './extension/selection'

interface Props {
  data?: unknown;
  keymap?: any;
  config: Config;
  markdown: boolean;
  path?: string;
  y?: YOptions;
  schema?: Schema;
}

const customKeymap = (props: Props): ProseMirrorExtension => ({
  plugins: (prev) => (props.keymap ? [...prev, keymap(props.keymap)] : prev)
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
export const createExtensions = (props: Props): ProseMirrorExtension[] =>
  props.markdown
    ? [
      placeholder('Просто начните...'),
      customKeymap(props),
      base(props.markdown),
      collab(props.y),
      selectionMenu()
    ]
    : [
      selectionMenu(),
      customKeymap(props),
      base(props.markdown),
      markdown(),
      todoList(),
      dragHandle(),
      code(),
      strikethrough(),
      link(),
      table(),
      image(props.path),
      pasteMarkdown(),
      collab(props.y)
      // scroll(props.config.typewriterMode),
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

export const createSchema = (props: Props) => {
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
