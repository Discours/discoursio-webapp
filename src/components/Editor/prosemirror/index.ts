import { EditorState } from 'prosemirror-state'
import { Schema } from 'prosemirror-model'
import type { NodeViewFn, ProseMirrorExtension, ProseMirrorState } from './helpers'

export const createEditorState = (
  text: ProseMirrorState,
  extensions: ProseMirrorExtension[],
  prevText?: EditorState
): {
  editorState: EditorState
  nodeViews: { [key: string]: NodeViewFn }
} => {
  const reconfigure = text instanceof EditorState && prevText?.schema
  let schemaSpec = { nodes: {} }
  let nodeViews = {}
  let plugins = []

  for (const extension of extensions) {
    if (extension.schema) {
      schemaSpec = extension.schema(schemaSpec)
    }

    if (extension.nodeViews) {
      nodeViews = { ...nodeViews, ...extension.nodeViews }
    }
  }

  const schema = reconfigure ? prevText.schema : new Schema(schemaSpec)
  for (const extension of extensions) {
    if (extension.plugins) {
      plugins = extension.plugins(plugins, schema)
    }
  }

  let editorState: EditorState
  if (reconfigure) {
    editorState = text.reconfigure({ schema, plugins } as Partial<EditorState>)
  } else if (text instanceof EditorState) {
    editorState = EditorState.fromJSON({ schema, plugins }, text.toJSON())
  } else if (text) {
    console.debug(text)
    editorState = EditorState.fromJSON({ schema, plugins }, text)
  }

  return { editorState, nodeViews }
}
