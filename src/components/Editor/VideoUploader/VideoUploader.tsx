import { clsx } from 'clsx'
import styles from './VideoUploader.module.scss'
import { useLocalize } from '../../../context/localize'
import { createDropzone } from '@solid-primitives/upload'
import { createSignal, Show } from 'solid-js'
import { useSnackbar } from '../../../context/snackbar'
// import { handleFileUpload } from '../../../utils/handleFileUpload'

type Props = {
  class?: string
}

export const VideoUploader = (props: Props) => {
  const { t } = useLocalize()
  const [dragActive, setDragActive] = createSignal(false)
  const [dragError, setDragError] = createSignal<string | undefined>()
  const {
    actions: { showSnackbar }
  } = useSnackbar()

  // const [videoUrl, setVideoUrl] = createSignal<string | undefined>()
  // const runUpload = async (file) => {
  //   try {
  //     const fileUrl = await handleFileUpload(file)
  //     setVideoUrl(fileUrl)
  //   } catch (error) {
  //     console.error('[runUpload]', error)
  //   }
  // }

  const { setRef: dropzoneRef, files: droppedFiles } = createDropzone({
    onDrop: async () => {
      setDragActive(false)
      if (droppedFiles().length > 1) {
        setDragError(t('Many files, choose only one'))
      } else if (droppedFiles()[0].file.type.startsWith('video/')) {
        showSnackbar({
          body: t(
            'This functionality is currently not available, we would like to work on this issue. Use the download link.'
          )
        })
        // await runUpload(droppedFiles()[0])
      } else {
        setDragError(t('Video format not supported'))
      }
    }
  })
  const handleDrag = (event) => {
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true)
      setDragError()
    } else if (event.type === 'dragleave') {
      setDragActive(false)
    }
  }

  return (
    <div class={clsx(styles.VideoUploader, props.class)}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        ref={dropzoneRef}
        class={clsx(styles.dropArea, { [styles.active]: dragActive() })}
      >
        {t('Upload video')}
      </div>
      <Show when={dragError()}>
        <div class={styles.error}>{dragError()}</div>
      </Show>
    </div>
  )
}
