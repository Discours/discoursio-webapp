import type { Author } from '../../graphql/types.gen'
import { AuthorCard } from './AuthorCard'
import styles from './Full.module.scss'
import clsx from 'clsx'

export const AuthorFull = (props: { author: Author }) => {
  return (
    <div class={clsx(styles.userDetails)}>
      <AuthorCard author={props.author} isAuthorPage={true} />
    </div>
  )
}
