import { EditorState } from 'prosemirror-state'
import { serialize } from './markdown'

export const copy = async (text: string): Promise<void> => {
  navigator.clipboard.writeText(text)
}

export const copyAllAsMarkdown = async (state: EditorState): Promise<void> => {
  const text = serialize(state)
  navigator.clipboard.writeText(text)
}
