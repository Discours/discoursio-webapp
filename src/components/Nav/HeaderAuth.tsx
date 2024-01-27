import { getPagePath } from '@nanostores/router'
import { clsx } from 'clsx'
import { createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js'

import { useEditorContext } from '../../context/editor'
import { useLocalize } from '../../context/localize'
import { useNotifications } from '../../context/notifications'
import { useSession } from '../../context/session'
import { router, useRouter } from '../../stores/router'
import { showModal } from '../../stores/ui'
import { Button } from '../_shared/Button'
import { Icon } from '../_shared/Icon'
import { Popover } from '../_shared/Popover'
import { ShowOnlyOnClient } from '../_shared/ShowOnlyOnClient'
import { Userpic } from '../Author/Userpic'

import { ProfilePopup } from './ProfilePopup'

import styles from './Header/Header.module.scss'

type Props = {
  setIsProfilePopupVisible: (value: boolean) => void
}

type IconedButtonProps = {
  value: string
  icon: string
  action: () => void
}

const MD_WIDTH_BREAKPOINT = 992
export const HeaderAuth = (props: Props) => {
  const { t } = useLocalize()
  const { page } = useRouter()
  const { session, author, isAuthenticated, isSessionLoaded } = useSession()
  const {
    unreadNotificationsCount,
    actions: { showNotificationsPanel },
  } = useNotifications()

  const {
    form,
    actions: { toggleEditorPanel, saveShout, publishShout },
  } = useEditorContext()

  const handleBellIconClick = (event: Event) => {
    event.preventDefault()

    if (!isAuthenticated()) {
      showModal('auth')
      return
    }

    showNotificationsPanel()
  }

  const isEditorPage = createMemo(() => page().route === 'edit' || page().route === 'editSettings')
  const isNotificationsVisible = createMemo(() => isAuthenticated() && !isEditorPage())
  const isSaveButtonVisible = createMemo(() => isAuthenticated() && isEditorPage())
  const isCreatePostButtonVisible = createMemo(() => isAuthenticated() && !isEditorPage())
  const isAuthenticatedControlsVisible = createMemo(
    () => isAuthenticated() && session()?.user?.email_verified,
  )

  const handleBurgerButtonClick = () => {
    toggleEditorPanel()
  }

  const handleSaveButtonClick = () => {
    saveShout(form)
  }

  const handlePublishButtonClick = () => {
    publishShout(form)
  }

  const [width, setWidth] = createSignal(0)

  onMount(() => {
    const handleResize = () => setWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    onCleanup(() => window.removeEventListener('resize', handleResize))
  })

  const renderIconedButton = (buttonProps: IconedButtonProps) => {
    return (
      <Show
        when={width() < MD_WIDTH_BREAKPOINT}
        fallback={
          <Button
            value={<span class={styles.textLabel}>{buttonProps.value}</span>}
            variant={'light'}
            onClick={buttonProps.action}
            class={styles.editorControl}
          />
        }
      >
        <Popover content={buttonProps.value}>
          {(ref) => (
            <Button
              ref={ref}
              variant={'light'}
              onClick={buttonProps.action}
              value={<Icon name={buttonProps.icon} class={styles.icon} />}
              class={styles.editorControl}
            />
          )}
        </Popover>
      </Show>
    )
  }

  return (
    <ShowOnlyOnClient>
      <Show when={isSessionLoaded()} keyed={true}>
        <div class={clsx('col-auto col-lg-7', styles.usernav)}>
          <div class={styles.userControl}>
            <Show when={isCreatePostButtonVisible()}>
              <div class={clsx(styles.userControlItem, styles.userControlItemVerbose)}>
                <a href={getPagePath(router, 'create')}>
                  <span class={styles.textLabel}>{t('Create post')}</span>
                  <Icon name="pencil" class={styles.icon} />
                  <Icon name="pencil" class={clsx(styles.icon, styles.iconHover)} />
                </a>
              </div>
            </Show>

            <Show when={!isSaveButtonVisible()}>
              <div class={styles.userControlItem}>
                <button onClick={() => showModal('search')}>
                  <Icon name="search" class={styles.icon} />
                  <Icon name="search" class={clsx(styles.icon, styles.iconHover)} />
                </button>
              </div>
            </Show>

            <Show when={isNotificationsVisible() || !author()}>
              <div class={styles.userControlItem} onClick={handleBellIconClick}>
                <div class={styles.button}>
                  <Icon
                    name="bell-white"
                    counter={session() ? unreadNotificationsCount() || 0 : 1}
                    class={styles.icon}
                  />
                  <Icon
                    name="bell-white-hover"
                    counter={session() ? unreadNotificationsCount() || 0 : 1}
                    class={clsx(styles.icon, styles.iconHover)}
                  />
                </div>
              </div>
            </Show>

            <Show when={isSaveButtonVisible()}>
              <div class={clsx(styles.userControlItem, styles.userControlItemVerbose)}>
                {renderIconedButton({
                  value: t('Save'),
                  icon: 'save',
                  action: handleSaveButtonClick,
                })}
              </div>

              <div class={clsx(styles.userControlItem, styles.userControlItemVerbose)}>
                {renderIconedButton({
                  value: t('Publish'),
                  icon: 'publish',
                  action: handlePublishButtonClick,
                })}
              </div>

              <div class={clsx(styles.userControlItem, styles.userControlItemVerbose)}>
                <Popover content={t('Settings')}>
                  {(ref) => (
                    <Button
                      ref={ref}
                      value={<Icon name="burger" />}
                      variant={'light'}
                      onClick={handleBurgerButtonClick}
                      class={styles.settingsControl}
                    />
                  )}
                </Popover>
              </div>
            </Show>
            <Show
              when={isAuthenticatedControlsVisible()}
              fallback={
                <div class={clsx(styles.userControlItem, styles.userControlItemVerbose, 'loginbtn')}>
                  <a href="?m=auth&mode=login">
                    <span class={styles.textLabel}>{t('Enter')}</span>
                    <Icon name="key" class={styles.icon} />
                    {/*<Icon name="user-default" class={clsx(styles.icon, styles.iconHover)} />*/}
                  </a>
                </div>
              }
            >
              <Show when={!isSaveButtonVisible()}>
                <div class={clsx(styles.userControlItem, styles.userControlItemInbox)}>
                  <a href={getPagePath(router, 'inbox')}>
                    <div classList={{ entered: page().path === '/inbox' }}>
                      <Icon name="inbox-white" class={styles.icon} />
                      <Icon name="inbox-white-hover" class={clsx(styles.icon, styles.iconHover)} />
                    </div>
                  </a>
                </div>
              </Show>
              <ProfilePopup
                onVisibilityChange={(isVisible) => {
                  props.setIsProfilePopupVisible(isVisible)
                }}
                containerCssClass={styles.control}
                trigger={
                  <div class={styles.userControlItem}>
                    <button class={styles.button}>
                      <div classList={{ entered: page().path === `/${author()?.slug}` }}>
                        <Userpic
                          size={'M'}
                          name={author()?.name}
                          userpic={author()?.pic}
                          class={styles.userpic}
                        />
                      </div>
                    </button>
                  </div>
                }
              />
            </Show>
          </div>
        </div>
      </Show>
    </ShowOnlyOnClient>
  )
}
