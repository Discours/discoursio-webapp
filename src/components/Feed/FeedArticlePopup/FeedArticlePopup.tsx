import type { PopupProps } from '../../_shared/Popup'

import { clsx } from 'clsx'
import { Show, createSignal } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { Icon } from '../../_shared/Icon'
import { Popup } from '../../_shared/Popup'
import { SoonChip } from '../../_shared/SoonChip'

import styles from './FeedArticlePopup.module.scss'

type Props = {
  canEdit: boolean
  onInviteClick: () => void
  onShareClick: () => void
} & Omit<PopupProps, 'children'>

export const FeedArticlePopup = (props: Props) => {
  const { t } = useLocalize()
  const [hidePopup, setHidePopup] = createSignal(false)
  return (
    <>
      <Popup
        {...props}
        //TODO: fix hide logic
        closePopup={hidePopup()}
        horizontalAnchor={'right'}
        variant="tiny"
        popupCssClass={styles.feedArticlePopup}
      >
        <ul class={clsx('nodash', styles.actionList)}>
          <li>
            <button
              class={styles.action}
              role="button"
              onClick={() => {
                props.onShareClick()
                setHidePopup(true)
              }}
            >
              <Icon name="share-outline" class={styles.icon} />
              <div class={styles.title}>{t('Share')}</div>
            </button>
          </li>
          <Show when={!props.canEdit}>
            <li>
              <button
                class={styles.action}
                role="button"
                onClick={() => {
                  alert('Help to edit')
                  setHidePopup(true)
                }}
              >
                <Icon name="pencil-outline" class={styles.icon} />
                <div class={styles.title}>{t('Help to edit')}</div>
              </button>
            </li>
          </Show>
          <li>
            <button
              class={styles.action}
              role="button"
              onClick={() => {
                props.onInviteClick()
                setHidePopup(false)
              }}
            >
              <Icon name="expert" class={styles.icon} />
              <div class={styles.title}>{t('Invite experts')}</div>
            </button>
          </li>
          <Show when={!props.canEdit}>
            <li>
              <button class={clsx(styles.action, styles.soon)} role="button">
                <Icon name="bell-white" class={styles.icon} />
                <div class={styles.title}>{t('Subscribe to comments')}</div>
                <SoonChip />
              </button>
            </li>
          </Show>
          <li>
            <button class={clsx(styles.action, styles.soon)} role="button">
              <Icon name="bookmark" class={styles.icon} />
              <div class={styles.title}>{t('Add to bookmarks')}</div>
              <SoonChip />
            </button>
          </li>
          {/*<Show when={!props.canEdit}>*/}
          {/*  <li>*/}
          {/*    <button*/}
          {/*      class={styles.action}*/}
          {/*      role="button"*/}
          {/*      onClick={() => {*/}
          {/*        alert('Report')*/}
          {/*      }}*/}
          {/*    >*/}
          {/*      {t('Report')}*/}
          {/*    </button>*/}
          {/*  </li>*/}
          {/*</Show>*/}
          {/*<li>*/}
          {/*  <button*/}
          {/*    class={styles.action}*/}
          {/*    role="button"*/}
          {/*    onClick={() => {*/}
          {/*      alert('Get notifications')*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    {t('Get notifications')}*/}
          {/*  </button>*/}
          {/*</li>*/}
        </ul>
      </Popup>
    </>
  )
}
