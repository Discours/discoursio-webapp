import type { PopupProps } from '../../_shared/Popup'

import { clsx } from 'clsx'
import { createEffect, createSignal, onMount, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { Popup } from '../../_shared/Popup'
import { SoonChip } from '../../_shared/SoonChip'

import styles from './FeedArticlePopup.module.scss'

type Props = {
  isOwner: boolean
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
                  setHidePopup(true)
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
                props.onInviteClick()
                setHidePopup(false)
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
    </>
  )
}
