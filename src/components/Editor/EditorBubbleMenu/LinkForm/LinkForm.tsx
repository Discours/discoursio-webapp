import styles from './LinkForm.module.scss'
import { Icon } from '../../../_shared/Icon'
import { createEditorTransaction } from 'solid-tiptap'
import validateUrl from '../../../../utils/validateUrl'
import type { Editor } from '@tiptap/core'
import { createSignal } from 'solid-js'
import { useLocalize } from '../../../../context/localize'
import { clsx } from 'clsx'

type Props = {
  editor: Editor
  onClose: () => void
}

export const LinkForm = (props: Props) => {
  const { t } = useLocalize()
  const [url, setUrl] = createSignal('')
  const [linkError, setLinkError] = createSignal('')

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
    props.onClose()
  }

  const handleUrlInput = (value) => {
    setUrl(value)
  }

  const handleSaveButtonClick = () => {
    if (!validateUrl(url())) {
      setLinkError(t('Invalid url format'))
      return
    }

    props.editor.chain().focus().setLink({ href: url() }).run()
    props.onClose()
  }

  const handleKeyPress = (event) => {
    setLinkError('')
    const key = event.key

    if (key === 'Enter') {
      handleSaveButtonClick()
    }

    if (key === 'Esc') {
      clearLinkForm()
    }
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
          onInput={(e) => handleUrlInput(e.currentTarget.value)}
        />
        <button type="button" onClick={handleSaveButtonClick} disabled={linkError() !== ''}>
          <Icon name="status-done" />
        </button>
        <button type="button" onClick={() => clearLinkForm()}>
          {currentUrl() ? 'Ж' : <Icon name="status-cancel" />}
        </button>
      </div>

      <div class={clsx(styles.linkError, { [styles.visible]: Boolean(linkError()) })}>{linkError()}</div>
    </div>
  )
}
