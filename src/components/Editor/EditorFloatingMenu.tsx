import { createSignal, Show } from 'solid-js'
import type { Editor } from '@tiptap/core'
import { Icon } from '../_shared/Icon'
import { InlineForm } from './InlineForm'
import styles from './EditorFloatingMenu.module.scss'
import HTMLParser from 'html-to-json-parser'
import { useLocalize } from '../../context/localize'

type FloatingMenuProps = {
  editor: Editor
  ref: (el: HTMLDivElement) => void
}

const embedData = async (data) => {
  const result = await HTMLParser(data, false)
  if (result && 'type' in result && result.type === 'iframe') {
    return result.attributes
  }
}

export const EditorFloatingMenu = (props: FloatingMenuProps) => {
  const { t } = useLocalize()
  const [inlineEditorOpen, setInlineEditorOpen] = createSignal<boolean>(false)

  const handleEmbedFormSubmit = async (value: string) => {
    // TODO: add support instagram embed (blockquote)
    const emb = await embedData(value)
    props.editor.chain().focus().setIframe(emb).run()
  }

  const validateEmbed = async (value) => {
    const iframeData = await HTMLParser(value, false)
    if (iframeData && iframeData.type !== 'iframe') {
      return
    }
  }

  return (
    <div ref={props.ref} class={styles.editorFloatingMenu}>
      <button type="button" onClick={() => setInlineEditorOpen(true)}>
        <Icon name="editor-plus" />
      </button>
      <Show when={inlineEditorOpen()}>
        <InlineForm
          variant="inFloating"
          onClose={() => setInlineEditorOpen(false)}
          validate={validateEmbed}
          onSubmit={handleEmbedFormSubmit}
        />
      </Show>
    </div>
  )
}
