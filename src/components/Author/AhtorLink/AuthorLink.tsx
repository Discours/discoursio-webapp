import { clsx } from 'clsx'
import styles from './AhtorLink.module.scss'
import { Author } from '../../../graphql/types.gen'
import { Userpic } from '../Userpic'

type Props = {
  author: Author
  size?: 'S' | 'M' | 'L'
  class?: string
}

export const AuthorLink = (props: Props) => {
  return (
    <div class={clsx(styles.AuthorLink, props.class, styles[props.size ?? 'M'])}>
      <a class={styles.link} href={`/author/${props.author.slug}`}>
        <Userpic size={props.size ?? 'M'} name={props.author.name} userpic={props.author.userpic} />
        <div class={styles.name}>{props.author.name}</div>
      </a>
    </div>
  )
}
