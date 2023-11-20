import { clsx } from 'clsx'

import { Author } from '../../../graphql/types.gen'
import { Userpic } from '../Userpic'

import styles from './AhtorLink.module.scss'

type Props = {
  author: Author
  size?: 'XS' | 'M' | 'L'
  class?: string
  isFloorImportant?: boolean
}

export const AuthorLink = (props: Props) => {
  return (
    <div
      class={clsx(styles.AuthorLink, props.class, styles[props.size ?? 'M'], {
        [styles.authorLinkFloorImportant]: props.isFloorImportant,
      })}
    >
      <a class={styles.link} href={`/author/${props.author.slug}`}>
        <Userpic size={props.size ?? 'M'} name={props.author.name} userpic={props.author.userpic} />
        <div class={styles.name}>{props.author.name}</div>
      </a>
    </div>
  )
}
