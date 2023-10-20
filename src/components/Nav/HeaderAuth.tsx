import styles from './Header/Header.module.scss'
import { clsx } from 'clsx'
import { router, useRouter } from '../../stores/router'
import { Icon } from '../_shared/Icon'
import { createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { ProfilePopup } from './ProfilePopup'
import { Userpic } from '../Author/Userpic'
import { showModal } from '../../stores/ui'
import { ShowOnlyOnClient } from '../_shared/ShowOnlyOnClient'
import { useSession } from '../../context/session'
import { useLocalize } from '../../context/localize'
import { getPagePath } from '@nanostores/router'
import { Button } from '../_shared/Button'
import { useEditorContext } from '../../context/editor'
import { Popover } from '../_shared/Popover'
import { useNotifications } from '../../context/notifications'

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
  const { session, isSessionLoaded, isAuthenticated } = useSession()
  const {
    unreadNotificationsCount,
    actions: { showNotificationsPanel }
  } = useNotifications()

  const {
    form,
    actions: { toggleEditorPanel, saveShout, publishShout }
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
  const isAuthenticatedControlsVisible = createMemo(() => isAuthenticated())

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
            variant={'outline'}
            onClick={buttonProps.action}
          />
        }
      >
        <Popover content={buttonProps.value}>
          {(ref) => (
            <Button
              ref={ref}
              variant={'outline'}
              onClick={buttonProps.action}
              value={<Icon name={buttonProps.icon} class={styles.icon} />}
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

            <div class={styles.userControlItem}>
              <a href="#">
                <Icon name="search" class={styles.icon} />
                <Icon name="search" class={clsx(styles.icon, styles.iconHover)} />
              </a>
            </div>

            <Show when={isNotificationsVisible()}>
              <div class={styles.userControlItem} onClick={handleBellIconClick}>
                <div class={styles.button}>
                  <Icon name="bell-white" counter={unreadNotificationsCount()} class={styles.icon} />
                  <Icon
                    name="bell-white-hover"
                    counter={unreadNotificationsCount()}
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
                  action: handleSaveButtonClick
                })}
              </div>

              <div class={clsx(styles.userControlItem, styles.userControlItemVerbose)}>
                {renderIconedButton({
                  value: t('Publish'),
                  icon: 'publish',
                  action: handlePublishButtonClick
                })}
              </div>

              <div class={clsx(styles.userControlItem, styles.userControlItemVerbose)}>
                <Popover content={t('Settings')}>
                  {(ref) => (
                    <Button
                      ref={ref}
                      value={<Icon name="burger" />}
                      variant={'outline'}
                      onClick={handleBurgerButtonClick}
                    />
                  )}
                </Popover>
              </div>
            </Show>
            <Show
              when={isAuthenticatedControlsVisible()}
              fallback={
                <div class={clsx(styles.userControlItem, styles.userControlItemVerbose, 'loginbtn')}>
                  <a href="?modal=auth&mode=login">
                    <span class={styles.textLabel}>{t('Enter')}</span>
                    <Icon name="key" class={styles.icon} />
                    {/*<Icon name="user-default" class={clsx(styles.icon, styles.iconHover)} />*/}
                  </a>
                </div>
              }
            >
              <div class={clsx(styles.userControlItem, styles.userControlItemInbox)}>
                <a href="/inbox">
                  {/*FIXME: replace with route*/}
                  <div classList={{ entered: page().path === '/inbox' }}>
                    <Icon name="inbox-white" counter={session()?.news?.unread || 0} class={styles.icon} />
                    <Icon
                      name="inbox-white-hover"
                      counter={session()?.news?.unread || 0}
                      class={clsx(styles.icon, styles.iconHover)}
                    />
                  </div>
                </a>
              </div>
              <ProfilePopup
                onVisibilityChange={(isVisible) => {
                  props.setIsProfilePopupVisible(isVisible)
                }}
                containerCssClass={styles.control}
                trigger={
                  <div class={styles.userControlItem}>
                    <button class={styles.button}>
                      <div classList={{ entered: page().path === `/${session().user?.slug}` }}>
                        <Userpic
                          size={'M'}
                          name={session().user.name}
                          userpic={session().user.userpic}
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
