import type { PopupProps } from '../../_shared/Popup'

import { clsx } from 'clsx'
import { Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { showModal } from '../../../stores/ui'
import { InviteCoAuthorsModal } from '../../_shared/InviteCoAuthorsModal'
import { Popup } from '../../_shared/Popup'
import { ShareModal } from '../../_shared/ShareModal'
import { SoonChip } from '../../_shared/SoonChip'

import styles from './FeedArticlePopup.module.scss'

type FeedArticlePopupProps = {
  isOwner: boolean
  onInviteClick: () => void
  onShareClick: () => void
} & Omit<PopupProps, 'children'>

export const FeedArticlePopup = (props: FeedArticlePopupProps) => {
  const { t } = useLocalize()
  return (
    <>
      <Popup {...props} horizontalAnchor={'right'} variant="tiny" popupCssClass={styles.feedArticlePopup}>
        <ul class={clsx('nodash', styles.actionList)}>
          <li>
            <button class={styles.action} role="button" onClick={props.onShareClick}>
              {t('Share')}
            </button>
          </li>
          <Show when={!props.isOwner}>
            <li>
              <button
                class={styles.action}
                role="button"
                onClick={() => {
                  alert('Help to edit')
                }}
              >
                {t('Help to edit')}
              </button>
            </li>
          </Show>
          <li>
            <button class={styles.action} role="button" onClick={props.onInviteClick}>
              {t('Invite experts')}
            </button>
          </li>
          <Show when={!props.isOwner}>
            <li>
              <button class={clsx(styles.action, styles.soon)} role="button">
                {t('Subscribe to comments')} <SoonChip />
              </button>
            </li>
          </Show>
          <li>
            <button class={clsx(styles.action, styles.soon)} role="button">
              {t('Add to bookmarks')} <SoonChip />
            </button>
          </li>
          {/*<Show when={!props.isOwner}>*/}
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
