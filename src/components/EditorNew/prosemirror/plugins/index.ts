import { history } from 'prosemirror-history'
import { dropCursor } from 'prosemirror-dropcursor'
import { placeholder } from './placeholder'
import styles from '../styles/ProseMirror.module.scss'
import type { DiscoursSchema } from '../schema'
import { dragHandle } from './dragHandle'
import { selectionMenu } from './selectionMenu'
import { imageInput } from './image'
import { customKeymap } from './customKeymap'
import { useLocalize } from '../../../../context/localize'

export const createPlugins = ({ schema }: { schema: DiscoursSchema }) => {
  const { t } = useLocalize()
  return [
    placeholder(t('Just start typing...')),
    customKeymap(),
    history(),
    dropCursor({ class: styles.dropCursor }),
    selectionMenu(schema),
    dragHandle(),
    imageInput(schema)
    // TODO
    // link(),
  ]
}
