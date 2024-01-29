import { openPage } from '@nanostores/router'
import { clsx } from 'clsx'
import { createEffect, createMemo, createSignal, Match, Show, Switch } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useMediaQuery } from '../../../context/mediaQuery'
import { useSession } from '../../../context/session'
import { Author, FollowingEntity } from '../../../graphql/schema/core.gen'
import { router, useRouter } from '../../../stores/router'
import { isCyrillic } from '../../../utils/cyrillic'
import { translit } from '../../../utils/ru2en'
import { Button } from '../../_shared/Button'
import { CheckButton } from '../../_shared/CheckButton'
import { ConditionalWrapper } from '../../_shared/ConditionalWrapper'
import { FollowButton } from '../../_shared/FollowButton'
import { Icon } from '../../_shared/Icon'
import { Userpic } from '../Userpic'

import styles from './AuthorBadge.module.scss'

type Props = {
  author: Author
  minimizeSubscribeButton?: boolean
  showMessageButton?: boolean
  iconButtons?: boolean
  nameOnly?: boolean
  inviteView?: boolean
  onInvite?: (id: number) => void
  selected?: boolean
}
export const AuthorBadge = (props: Props) => {
  const { mediaMatches } = useMediaQuery()
  const [isMobileView, setIsMobileView] = createSignal(false)

  createEffect(() => {
    setIsMobileView(!mediaMatches.sm)
  })

  const {
    author,
    actions: { requireAuthentication },
  } = useSession()

  const { changeSearchParams } = useRouter()
  const { t, formatDate, lang } = useLocalize()

  const initChat = () => {
    // eslint-disable-next-line solid/reactivity
    requireAuthentication(() => {
      openPage(router, `inbox`)
      changeSearchParams({
        initChat: props.author.id.toString(),
      })
    }, 'discussions')
  }

  const name = createMemo(() => {
    if (lang() !== 'ru' && isCyrillic(props.author.name)) {
      if (props.author.name === 'Дискурс') {
        return 'Discours'
      }

      return translit(props.author.name)
    }

    return props.author.name
  })

  return (
    <div class={clsx(styles.AuthorBadge, { [styles.nameOnly]: props.nameOnly })}>
      <div class={styles.basicInfo}>
        <Userpic
          hasLink={true}
          size={isMobileView() ? 'M' : 'L'}
          name={name()}
          userpic={props.author.pic}
          slug={props.author.slug}
        />
        <ConditionalWrapper
          condition={!props.inviteView}
          wrapper={(children) => (
            <a href={`/author/${props.author.slug}`} class={styles.info}>
              {children}
            </a>
          )}
        >
          <div class={styles.name}>
            <span>{name()}</span>
          </div>
          <Show when={!props.nameOnly}>
            <Switch
              fallback={
                <div class={styles.bio}>
                  {t('Registered since {date}', {
                    date: formatDate(new Date(props.author.created_at * 1000)),
                  })}
                </div>
              }
            >
              <Match when={props.author.bio}>
                <div class={clsx('text-truncate', styles.bio)} innerHTML={props.author.bio} />
              </Match>
              <Match when={props.author?.stat && props.author?.stat.shouts > 0}>
                <div class={styles.bio}>
                  {t('PublicationsWithCount', { count: props.author.stat?.shouts ?? 0 })}
                </div>
              </Match>
            </Switch>
          </Show>
        </ConditionalWrapper>
      </div>
      <Show when={props.author.slug !== author()?.slug && !props.nameOnly}>
        <div class={styles.actions}>
          <FollowButton
            slug={props.author.slug}
            entity={FollowingEntity.Author}
            iconButton={props.iconButtons}
            minimizeSubscribeButton={props.minimizeSubscribeButton}
          />

          <Show when={props.showMessageButton}>
            <Button
              variant={props.iconButtons ? 'secondary' : 'bordered'}
              size="S"
              value={props.iconButtons ? <Icon name="inbox-white" /> : t('Message')}
              onClick={initChat}
              class={clsx(styles.actionButton, { [styles.iconed]: props.iconButtons })}
            />
          </Show>
        </div>
      </Show>
      <Show when={props.inviteView}>
        <CheckButton
          text={t('Invite')}
          checked={props.selected}
          onClick={() => props.onInvite(props.author.id)}
        />
      </Show>
    </div>
  )
}
