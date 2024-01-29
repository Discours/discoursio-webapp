import 'cropperjs/dist/cropper.css'

import { UploadFile } from '@solid-primitives/upload'
import Cropper from 'cropperjs'
import { createSignal, onMount, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { Button } from '../Button'

import styles from './ImageCropper.module.scss'

interface CropperProps {
  uploadFile: UploadFile
  onSave: (any) => void
  onDecline?: () => void
}

export const ImageCropper = (props: CropperProps) => {
  const { t } = useLocalize()

  const imageTagRef: { current: HTMLImageElement } = {
    current: null,
  }

  const [cropper, setCropper] = createSignal(null)

  onMount(() => {
    if (imageTagRef.current) {
      setCropper(
        new Cropper(imageTagRef.current, {
          viewMode: 1,
          aspectRatio: 1,
          guides: false,
          background: false,
          rotatable: false,
          autoCropArea: 1,
          modal: true,
        }),
      )
    }
  })
  const handleSave = (_ev) => {
    cropper()
      .getCroppedCanvas()
      // eslint-disable-next-line solid/reactivity
      .toBlob((blob) => {
        const formData = new FormData()
        formData.append('media', blob, props.uploadFile.file.name)

        props.onSave({
          ...props.uploadFile,
          file: formData.get('media'),
        })
      })
  }
  return (
    <div>
      <div class={styles.cropperContainer}>
        <img
          ref={(el) => (imageTagRef.current = el)}
          src={props.uploadFile.source}
          alt="image crop panel"
        />
      </div>

      <div class={styles.cropperControls}>
        <Show when={props.onDecline}>
          <Button variant="secondary" onClick={props.onDecline} value={t('Decline')} />
        </Show>

        <Button variant="primary" onClick={handleSave} value={t('Save')} />
      </div>
    </div>
  )
}
