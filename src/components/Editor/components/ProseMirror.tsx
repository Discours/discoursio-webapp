import { createEffect, untrack } from 'solid-js'
import { Store, unwrap } from 'solid-js/store'
import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema } from 'prosemirror-model'
import { NodeViewFn, ProseMirrorExtension, ProseMirrorState } from '../prosemirror/helpers'

interface Props {
  style?: string;
  className?: string;
  text?: Store<ProseMirrorState>;
  editorView?: Store<EditorView>;
  extensions?: Store<ProseMirrorExtension[]>;
  onInit: (s: EditorState, v: EditorView) => void;
  onReconfigure: (s: EditorState) => void;
  onChange: (s: EditorState) => void;
}

export const ProseMirror = (props: Props) => {
  let editorRef: HTMLDivElement
  const editorView = () => untrack(() => unwrap(props.editorView))

  const dispatchTransaction = (tr: Transaction) => {
    if (!editorView()) return
    const newState = editorView().state.apply(tr)
    editorView().updateState(newState)
    if (!tr.docChanged) return
    props.onChange(newState)
  }

  createEffect((payload: [EditorState, ProseMirrorExtension[]]) => {
    const [prevText, prevExtensions] = payload
    const text: EditorState = unwrap(props.text)
    const extensions: ProseMirrorExtension[] = unwrap(props.extensions)
    if (!text || !extensions?.length) {
      return [text, extensions]
    }

    if (!props.editorView) {
      const { editorState, nodeViews } = createEditorState(text, extensions)
      const view = new EditorView(editorRef, { state: editorState, nodeViews, dispatchTransaction })
      view.focus()
      props.onInit(editorState, view)
      return [editorState, extensions]
    }

    if (extensions !== prevExtensions || (!(text instanceof EditorState) && text !== prevText)) {
      const { editorState, nodeViews } = createEditorState(text, extensions, prevText)
      if (!editorState) return
      editorView().updateState(editorState)
      editorView().setProps({ nodeViews, dispatchTransaction })
      props.onReconfigure(editorState)
      editorView().focus()
      return [editorState, extensions]
    }

    return [text, extensions]
  },
  [props.text, props.extensions]
  )

  return (
    <div
      style={props.style}
      ref={editorRef}
      className={props.className}
      spell-check={false}
    />
  )
}

const createEditorState = (
  text: ProseMirrorState,
  extensions: ProseMirrorExtension[],
  prevText?: EditorState
): {
  editorState: EditorState;
  nodeViews: { [key: string]: NodeViewFn };
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
    editorState = text.reconfigure({ schema, plugins })
  } else if (text instanceof EditorState) {
    editorState = EditorState.fromJSON({ schema, plugins }, text.toJSON())
  } else if (text){
    console.debug(text)
    editorState = EditorState.fromJSON({ schema, plugins }, text)
  }

  return { editorState, nodeViews }
}
