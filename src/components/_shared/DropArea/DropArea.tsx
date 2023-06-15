import { clsx } from 'clsx'
import styles from './DropArea.module.scss'
import { createEffect, createSignal, For, JSX, Show } from 'solid-js'
import { createDropzone, UploadFile, fileUploader, createFileUploader } from '@solid-primitives/upload'
import { useLocalize } from '../../../context/localize'
import { validateFiles } from '../../../utils/validateFile'
import { FileTypeToUpload } from '../../../pages/types'
import { handleFileUpload, handleMultiplyFileUpload } from '../../../utils/handleFileUpload'

type Props = {
  class?: string
  placeholder: string
  description?: string | JSX.Element
  fileType: FileTypeToUpload
  isMultiply: boolean
  data: (value: string[]) => void
}

export const DropArea = (props: Props) => {
  const { t } = useLocalize()
  const [dragActive, setDragActive] = createSignal(false)
  const [dropAreaError, setDropAreaError] = createSignal<string>()
  const [filesToUpload, setFilesToUpload] = createSignal([])
  const [loading, setLoading] = createSignal(false)

  const runUpload = async (files) => {
    try {
      setLoading(true)
      const uploaded = files.map(async (file) => {
        await handleFileUpload(file)
      })

      console.log('!!! uploaded:', uploaded)
      props.data(uploaded)
      setLoading(false)
    } catch (error) {
      setDropAreaError('Error')
      console.error('[runUpload]', error)
    }
  }

  const { files, selectFiles } = createFileUploader({
    multiple: true,
    accept: `${props.fileType}/*`
  })

  const { setRef: dropzoneRef, files: droppedFiles } = createDropzone({
    onDrop: async () => {
      setDragActive(false)
      setFilesToUpload(droppedFiles())
    }
  })
  const handleDrag = (event) => {
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true)
    } else if (event.type === 'dragleave') {
      setDragActive(false)
    }
  }
  const handleDropFieldClick = () => {
    selectFiles((selectedFiles) => {
      const filesArray = selectedFiles.map((file) => {
        return file
      })
      setFilesToUpload(filesArray)
    })
  }

  createEffect(async () => {
    if (!props.isMultiply && filesToUpload().length > 1) {
      setDropAreaError(t('Many files, choose only one'))
      return
    }
    const isValid = validateFiles(props.fileType, filesToUpload())
    if (isValid) {
      await runUpload(filesToUpload())
    } else {
      setDropAreaError(t('Invalid file type'))
      return false
    }
  })

  return (
    <div class={clsx(styles.DropArea, props.class)}>
      <div
        class={clsx(styles.field, { [styles.active]: dragActive() })}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        ref={dropzoneRef}
        onClick={handleDropFieldClick}
      >
        <div class={styles.text}>{loading() ? 'Loading...' : props.placeholder}</div>
      </div>
      <Show when={dropAreaError()}>
        <div class={styles.error}>{dropAreaError()}</div>
      </Show>
      <Show when={!dropAreaError() && props.description}>
        <div class={styles.description}>{props.description}</div>
      </Show>
      <For each={files()}>{(file) => <p>{file.name}</p>}</For>
    </div>
  )
}
