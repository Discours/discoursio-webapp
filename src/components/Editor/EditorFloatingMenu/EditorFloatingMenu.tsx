import type { MenuItem } from './Menu/Menu'
import type { Editor } from '@tiptap/core'

import { createEffect, createSignal, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { UploadedFile } from '../../../pages/types'
import { showModal } from '../../../stores/ui'
import { renderUploadedImage } from '../../../utils/renderUploadedImage'
import { useOutsideClickHandler } from '../../../utils/useOutsideClickHandler'
import { Icon } from '../../_shared/Icon'
import { Modal } from '../../Nav/Modal'
import { InlineForm } from '../InlineForm'
import { UploadModalContent } from '../UploadModalContent'

import { Menu } from './Menu'

import styles from './EditorFloatingMenu.module.scss'

type FloatingMenuProps = {
  editor: Editor
  ref: (el: HTMLDivElement) => void
}

const embedData = async (data) => {
  const element = document.createRange().createContextualFragment(data)
  const { attributes } = element.firstChild as HTMLIFrameElement

  const result: { src: string; width?: string; height?: string } = { src: '' }

  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i]
    result[attribute.name] = attribute.value
  }

  return result
}

export const EditorFloatingMenu = (props: FloatingMenuProps) => {
  const { t } = useLocalize()
  const [selectedMenuItem, setSelectedMenuItem] = createSignal<MenuItem | undefined>()
  const [menuOpen, setMenuOpen] = createSignal<boolean>(false)
  const menuRef: { current: HTMLDivElement } = { current: null }
  const plusButtonRef: { current: HTMLButtonElement } = { current: null }
  const handleEmbedFormSubmit = async (value: string) => {
    // TODO: add support instagram embed (blockquote)
    const emb = await embedData(value)
    console.log('!!! emb:', emb)
    // props.editor.chain().focus().setIframe(emb).run()
    props.editor
      .chain()
      .focus()
      .insertContent({
        type: 'figure',
        attrs: { 'data-type': 'iframe' },
        content: [
          {
            type: 'figcaption',
            content: [{ type: 'text', text: t('Description') }],
          },
          {
            type: 'iframe',
            attrs: {
              src: emb.src,
              width: emb.width,
              height: emb.height,
            },
          },
        ],
      })
      .run()
  }

  const validateEmbed = async (value) => {
    const element = document.createRange().createContextualFragment(value)
    if (element.firstChild?.nodeName !== 'IFRAME') {
      return t('Error')
    }
  }

  createEffect(() => {
    switch (selectedMenuItem()) {
      case 'image': {
        showModal('uploadImage')
        return
      }
      case 'horizontal-rule': {
        props.editor.chain().focus().setHorizontalRule().run()
        setSelectedMenuItem()
        return
      }
    }
  })

  const closeUploadModalHandler = () => {
    setSelectedMenuItem()
    setMenuOpen(false)
  }

  useOutsideClickHandler({
    containerRef: menuRef,
    handler: (e) => {
      if (plusButtonRef.current.contains(e.target)) {
        return
      }

      if (menuOpen()) {
        setMenuOpen(false)
      }
    },
  })

  const handleUpload = (image: UploadedFile) => {
    renderUploadedImage(props.editor, image)
  }

  return (
    <>
      <div ref={props.ref} class={styles.editorFloatingMenu}>
        <button
          ref={(el) => (plusButtonRef.current = el)}
          type="button"
          onClick={() => setMenuOpen(!menuOpen())}
        >
          <Icon name="editor-plus" />
        </button>
        <Show when={menuOpen()}>
          <div class={styles.menuHolder} ref={(el) => (menuRef.current = el)}>
            <Show when={!selectedMenuItem()}>
              <Menu selectedItem={(value: MenuItem) => setSelectedMenuItem(value)} />
            </Show>
            <Show when={selectedMenuItem() === 'embed'}>
              <InlineForm
                placeholder={t('Paste Embed code')}
                showInput={true}
                onClose={closeUploadModalHandler}
                onClear={() => setSelectedMenuItem()}
                validate={validateEmbed}
                onSubmit={handleEmbedFormSubmit}
              />
            </Show>
          </div>
        </Show>
      </div>
      <Modal variant="narrow" name="uploadImage" onClose={closeUploadModalHandler}>
        <UploadModalContent
          onClose={(value) => {
            handleUpload(value)
            setSelectedMenuItem()
          }}
        />
      </Modal>
    </>
  )
}
