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
  title: string
  imageUrl: string
  isOwner: boolean
  description: string
  shareUrl: string
} & Omit<PopupProps, 'children'>

export const FeedArticlePopup = (props: FeedArticlePopupProps) => {
  const { t } = useLocalize()
  return (
    <>
      <Popup horizontalAnchor={'right'} {...props} variant="tiny" popupCssClass={styles.feedArticlePopup}>
        <ul class={clsx('nodash', styles.actionList)}>
          <li>
            <button class={styles.action} role="button" onClick={() => showModal('share')}>
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
            <button
              class={styles.action}
              role="button"
              onClick={() => {
                showModal('inviteCoAuthors')
              }}
            >
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
      <InviteCoAuthorsModal title={t('Invite experts')} />
      <ShareModal
        title={props.title}
        shareUrl={props.shareUrl}
        imageUrl={props.imageUrl}
        description={props.description}
      />
    </>
  )
}
