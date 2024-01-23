import { createInfiniteScroll } from '@solid-primitives/pagination'
import { clsx } from 'clsx'
import { For, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useAuthorsStore } from '../../../stores/zine/authors'
import { AuthorBadge } from '../../Author/AuthorBadge'
import { Modal } from '../../Nav/Modal'
import { Button } from '../Button'
import { DropdownSelect } from '../DropdownSelect'
import { Loading } from '../Loading'

import styles from './InviteMembers.module.scss'

const PAGE_SIZE = 50

type Props = {
  title?: string
  variant?: 'coauthors' | 'recipients'
}
export const InviteMembers = (props: Props) => {
  const { t } = useLocalize()
  const roles = [
    {
      title: t('Editor'),
      description: t('Can write and edit text directly, and accept or reject suggestions from others'),
    },
    {
      title: t('Co-author'),
      description: t('Can make any changes, accept or reject suggestions, and share access with others'),
    },
    {
      title: t('Commentator'),
      description: t('Can offer edits and comments, but cannot edit the post or share access with others'),
    },
  ]

  const { sortedAuthors } = useAuthorsStore({ sortBy: 'name' })

  const fetcher = async (page: number) => {
    // await new Promise(resolve => setTimeout(resolve, 2000)) // for loader debug

    const start = page * PAGE_SIZE
    const end = start + PAGE_SIZE
    return sortedAuthors().slice(start, end)
  }

  const [pages, infiniteScrollLoader, { end }] = createInfiniteScroll(fetcher)

  const handleInputChange = (value: string) => {
    console.log('!!! handleInputChange:', value)
  }

  console.log('!!! sortedAuthors:', sortedAuthors())

  const handleInvite = () => {
    console.log('!!! handleInvite:')
  }

  return (
    <Modal variant="medium" name="inviteMembers">
      <h2>{props.title || t('Invite collaborators')}</h2>
      <div class={clsx(styles.InviteMembers)}>
        <div class={styles.searchHeader}>
          <div class={styles.field}>
            <input
              class={styles.input}
              type="text"
              placeholder={t('Write your colleagues name or email')}
              onChange={(e) => handleInputChange(e.target.value)}
            />
            <Show when={props.variant === 'coauthors'}>
              <DropdownSelect selectItems={roles} />
            </Show>
          </div>
          <Button class={styles.searchButton} variant={'bordered'} size={'M'} value={t('Search')} />
        </div>
        <Show when={props.variant === 'coauthors'}>
          <div class={styles.teaser}>
            <h3>{t('Coming soon')}</h3>
            <p>
              {t(
                'We are working on collaborative editing of articles and in the near future you will have an amazing opportunity - to create together with your colleagues',
              )}
            </p>
          </div>
        </Show>
        <Show when={props.variant === 'recipients'}>
          <div class={styles.authors}>
            <For each={pages()}>
              {(author) => (
                <div class={styles.author}>
                  <AuthorBadge author={author} nameOnly={true} inviteView={true} onInvite={handleInvite} />
                </div>
              )}
            </For>
            <Show when={!end()}>
              <div use:infiniteScrollLoader class={styles.loading}>
                <div class={styles.icon}>
                  <Loading size="tiny" />
                </div>
                <div>{t('Loading')}</div>
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </Modal>
  )
}