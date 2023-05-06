import styles from './ImageView.module.scss'
import { ImageDisplay, updateAttrs } from '../../extensions/CustomImage'
import { Editor } from '@tiptap/core'
import { onMount } from 'solid-js'

type Props = {
  editor: Editor
}

export const ImageView = (props: Props) => {
  return <div class={styles.ImageView}>asdads</div>
}
