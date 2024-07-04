import { Editor } from '@tiptap/core'
import { createEditorTransaction } from 'solid-tiptap'

import { useLocalize } from '~/context/localize'
import { validateUrl } from '~/utils/validateUrl'
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
  const currentUrl = createEditorTransaction(
    () => props.editor,
    (ed) => {
      return ed?.getAttributes('link').href || ''
    }
  )
  const handleClearLinkForm = () => {
    if (currentUrl()) {
      props.editor.chain().focus().unsetLink().run()
    }
  }

  const handleLinkFormSubmit = (value: string) => {
    props.editor
      .chain()
      .focus()
      .setLink({ href: checkUrl(value) })
      .run()
  }

  return (
    <div>
      <InlineForm
        placeholder={t('Enter URL address')}
        initialValue={currentUrl() ?? ''}
        onClear={handleClearLinkForm}
        validate={(value) => (validateUrl(value) ? '' : t('Invalid url format'))}
        onSubmit={handleLinkFormSubmit}
        onClose={() => props.onClose()}
      />
    </div>
  )
}
