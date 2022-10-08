import { Plugin, EditorState } from 'prosemirror-state'
import type { Node, Schema, SchemaSpec } from 'prosemirror-model'
import type { Decoration, EditorView, NodeView } from 'prosemirror-view'

export type NodeViewFn = (
  node: Node,
  view: EditorView,
  getPos: () => number,
  decorations: Decoration[]
) => NodeView

export interface ProseMirrorExtension {
  schema?: (prev: SchemaSpec) => SchemaSpec
  plugins?: (prev: Plugin[], schema: Schema) => Plugin[]
  nodeViews?: { [key: string]: NodeViewFn }
}

export type ProseMirrorState = EditorState | unknown

export const isInitialized = (state: EditorState) => state !== undefined && state instanceof EditorState

export const isEmpty = (state: EditorState) =>
  !isInitialized(state) ||
  (state.doc.childCount === 1 &&
    !state.doc.firstChild.type.spec.code &&
    state.doc.firstChild.isTextblock &&
    state.doc.firstChild.content.size === 0)
