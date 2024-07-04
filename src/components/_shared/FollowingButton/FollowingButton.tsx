import { clsx } from 'clsx'
import { Show, createMemo } from 'solid-js'
import { useLocalize } from '~/context/localize'
import { Button } from '../Button'
import { CheckButton } from '../CheckButton'
import { Icon } from '../Icon'

import stylesButton from '../Button/Button.module.scss'
import styles from './FollowingButton.module.scss'

type Props = {
  class?: string
  isFollowed: boolean
  minimize?: boolean
  action: () => void
  iconButtons?: boolean
  actionMessageType?: 'follow' | 'unfollow'
}

export const FollowingButton = (props: Props) => {
  const { t } = useLocalize()

  const inActionText = createMemo(() => {
    return props.actionMessageType === 'follow' ? t('Following...') : t('Unfollowing...')
  })

  return (
    <div class={props.class}>
      <Show
        when={!props.minimize}
        fallback={<CheckButton text={t('Follow')} checked={props.isFollowed} onClick={props.action} />}
      >
        <Show
          when={props.isFollowed}
          fallback={
            <Button
              variant={props.iconButtons ? 'secondary' : 'bordered'}
              size="S"
              value={
                <Show
                  when={props.iconButtons}
                  fallback={props.actionMessageType ? inActionText() : t('Follow')}
                >
                  <Icon name="author-subscribe" class={stylesButton.icon} />
                </Show>
              }
              onClick={props.action}
              isSubscribeButton={true}
              class={clsx(styles.actionButton, {
                [styles.iconed]: props.iconButtons,
                [stylesButton.followed]: props.isFollowed
              })}
            />
          }
        >
          <Button
            variant={props.iconButtons ? 'secondary' : 'bordered'}
            size="S"
            value={
              <Show
                when={props.iconButtons}
                fallback={
                  props.actionMessageType ? (
                    inActionText()
                  ) : (
                    <>
                      <span class={styles.actionButtonLabel}>{t('Following')}</span>
                      <span class={styles.actionButtonLabelHovered}>{t('Unfollow')}</span>
                    </>
                  )
                }
              >
                <Icon name="author-unsubscribe" class={stylesButton.icon} />
              </Show>
            }
            onClick={props.action}
            isSubscribeButton={true}
            class={clsx(styles.actionButton, {
              [styles.iconed]: props.iconButtons,
              [stylesButton.followed]: props.isFollowed
            })}
          />
        </Show>
      </Show>
    </div>
  )
}
