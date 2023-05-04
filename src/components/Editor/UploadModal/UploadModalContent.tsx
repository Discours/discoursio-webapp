import styles from './UploadModalContent.module.scss'
import { clsx } from 'clsx'
import { Icon } from '../../_shared/Icon'
import { Button } from '../../_shared/Button'
import { createSignal, Show } from 'solid-js'
import { InlineForm } from '../InlineForm'
import { hideModal } from '../../../stores/ui'
import { createDropzone, createFileUploader } from '@solid-primitives/upload'
import { handleFileUpload } from '../../../utils/handleFileUpload'
import { useLocalize } from '../../../context/localize'
import { Editor } from '@tiptap/core'
import { Loading } from '../../_shared/Loading'
import { verifyImg } from '../../../utils/verifyImg'

type Props = {
  editor: Editor
}

export const UploadModalContent = (props: Props) => {
  const { t } = useLocalize()
  const [isUploading, setIsUploading] = createSignal(false)
  const [uploadError, setUploadError] = createSignal<string | undefined>()
  const [dragActive, setDragActive] = createSignal(false)
  const [dragError, setDragError] = createSignal<string | undefined>()

  const renderImage = (src: string) => {
    props.editor.chain().focus().extendMarkRange('link').setImage({ src: src }).run()
    hideModal()
  }
  const handleImageFormSubmit = async (value: string) => {
    renderImage(value)
  }

  const { selectFiles } = createFileUploader({ multiple: false, accept: 'image/*' })
  const runUpload = async (file) => {
    try {
      setIsUploading(true)
      const fileUrl = await handleFileUpload(file)
      setIsUploading(false)
      renderImage(fileUrl)
    } catch (error) {
      console.error('[upload image] error', error)
      setIsUploading(false)
      setUploadError(t('Error'))
    }
  }

  const handleUpload = async () => {
    await selectFiles(async ([uploadFile]) => {
      await runUpload(uploadFile)
    })
  }

  const { setRef: dropzoneRef, files: droppedFiles } = createDropzone({
    onDrop: async () => {
      setDragActive(false)
      if (droppedFiles().length > 1) {
        setDragError(t('Many files, choose only one'))
      } else if (droppedFiles()[0].file.type.startsWith('image/')) {
        await runUpload(droppedFiles()[0])
      } else {
        setDragError(t('Image format not supported'))
      }
    }
  })
  const handleDrag = (event) => {
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true)
    } else if (event.type === 'dragleave') {
      setDragActive(false)
    }
  }

  return (
    <div class={styles.uploadModalContent}>
      <Show when={!isUploading()} fallback={<Loading />}>
        <>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            ref={dropzoneRef}
            class={clsx(styles.dropZone, { [styles.active]: dragActive() })}
          >
            <Icon class={styles.icon} name="editor-image-dd" />
            <div class={clsx(styles.text, { [styles.error]: dragError() })}>
              {dragError() ?? t('Drag the image to this area')}
            </div>
          </div>
          <Button
            value={t('Upload')}
            variant="bordered"
            onClick={handleUpload}
            class={styles.uploadButton}
          />
          <Show when={uploadError()}>
            <div class={styles.error}>{uploadError()}</div>
          </Show>
          <div class={styles.formHolder}>
            <InlineForm
              autoFocus={false}
              placeholder={t('Or paste a link to an image')}
              showInput={true}
              onClose={() => {
                hideModal()
              }}
              validate={(value) => verifyImg(value)}
              onSubmit={handleImageFormSubmit}
              errorMessage={t('Invalid image link')}
            />
          </div>
        </>
      </Show>
    </div>
  )
}
