import { Editor } from '@tiptap/core'
import { createEffect, createSignal, onCleanup } from 'solid-js'

import { useLocalize } from '~/context/localize'
import { validateUrl } from '~/utils/validate'
import { InlineForm } from '../InlineForm'

type Props = {
  editor: Editor
  onClose: () => void
}

export const checkUrl = (url: string) => {
  try {
    new URL(url)
    return url
  } catch {
    return `https://${url}`
  }
}

export const InsertLinkForm = (props: Props) => {
  const { t } = useLocalize()
  const [currentUrl, setCurrentUrl] = createSignal('')

  createEffect(() => {
    const url = props.editor.getAttributes('link').href
    setCurrentUrl(url || '')
  })

  createEffect(() => {
    const updateListener = () => {
      const url = props.editor.getAttributes('link').href
      setCurrentUrl(url || '')
    }
    props.editor.on('update', updateListener)
    onCleanup(() => props.editor.off('update', updateListener))
  })

  const handleClearLinkForm = () => {
    if (currentUrl()) {
      props.editor?.chain().focus().unsetLink().run()
    }
  }

  const handleLinkFormSubmit = (value: string) => {
    props.editor
      ?.chain()
      .focus()
      .setLink({ href: checkUrl(value) })
      .run()
    props.onClose()
  }

  return (
    <div>
      <InlineForm
        placeholder={t('Enter URL address')}
        initialValue={currentUrl() ?? ''}
        onClear={handleClearLinkForm}
        validate={(value) => (validateUrl(value) ? '' : t('Invalid url format'))}
        onSubmit={handleLinkFormSubmit}
        onClose={props.onClose}
      />
    </div>
  )
}
