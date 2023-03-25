import styles from './LinkForm.module.scss'
import { Icon } from '../../../_shared/Icon'
import { createEditorTransaction } from 'solid-tiptap'
import validateUrl from '../../../../utils/validateUrl'
import type { Editor } from '@tiptap/core'
import { createSignal } from 'solid-js'
import { useLocalize } from '../../../../context/localize'

type Props = {
  editor: Editor
  editorOpen: boolean
}

export const LinkForm = (props: Props) => {
  const { t } = useLocalize()
  const [editorOpen, setEditorOpen] = createSignal<boolean>(props.editorOpen)
  const [url, setUrl] = createSignal<string>('')
  const [linkError, setLinkError] = createSignal<string | null>(null)

  createSignal(() => {
    setEditorOpen(props.editorOpen)
  })
  const currentUrl = createEditorTransaction(
    () => props.editor,
    (editor) => {
      return (editor && editor.getAttributes('link').href) || ''
    }
  )

  const clearLinkForm = () => {
    if (currentUrl()) {
      props.editor.chain().focus().unsetLink().run()
    }
    setUrl('')
    setEditorOpen(false)
  }

  const handleUrlChange = (value) => {
    setUrl(value)
  }

  const handleSubmitLink = () => {
    if (validateUrl(url())) {
      props.editor.chain().focus().setLink({ href: url() }).run()
      setEditorOpen(false)
    } else {
      setLinkError(t('Invalid url format'))
    }
  }

  const handleKeyPress = (event) => {
    const key = event.key
    if (key === 'Enter') handleSubmitLink()
    if (key === 'Esc') clearLinkForm()
  }

  return (
    <div class={styles.LinkForm}>
      <div class={styles.form}>
        <input
          type="text"
          placeholder={t('Enter URL address')}
          autofocus
          value={currentUrl()}
          onKeyPress={(e) => handleKeyPress(e)}
          onChange={(e) => handleUrlChange(e.currentTarget.value)}
        />
        <button type="button" onClick={() => handleSubmitLink()} disabled={linkError() !== null}>
          <Icon name="status-done" />
        </button>
        <button type="button" onClick={() => clearLinkForm()}>
          {currentUrl() ? 'Ж' : <Icon name="status-cancel" />}
        </button>
      </div>
      {linkError() && <div class={styles.linkError}>{linkError()}</div>}
    </div>
  )
}
