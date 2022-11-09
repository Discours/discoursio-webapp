import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'
import { history } from 'prosemirror-history'
import { dropCursor } from 'prosemirror-dropcursor'
import { placeholder } from './placeholder'
import { t } from '../../../../utils/intl'
import styles from '../styles/ProseMirror.module.scss'
import type { DiscoursSchema } from '../schema'
import { dragHandle } from './dragHandle'
import { selectionMenu } from './selectionMenu'
import { imageInput } from './image'
import { customKeymap } from './customKeymap'

export const createPlugins = ({ schema }: { schema: DiscoursSchema }) => {
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
