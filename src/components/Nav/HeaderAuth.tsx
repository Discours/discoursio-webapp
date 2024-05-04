import { getPagePath } from '@nanostores/router'
import { clsx } from 'clsx'
import { Show, createMemo, createSignal, onCleanup, onMount } from 'solid-js'

import { useEditorContext } from '../../context/editor'
import { useLocalize } from '../../context/localize'
import { useNotifications } from '../../context/notifications'
import { useSession } from '../../context/session'
import { router, useRouter } from '../../stores/router'
import { showModal } from '../../stores/ui'
import { Userpic } from '../Author/Userpic'
import { Button } from '../_shared/Button'
import { Icon } from '../_shared/Icon'
import { Popover } from '../_shared/Popover'
import { ShowOnlyOnClient } from '../_shared/ShowOnlyOnClient'

import { Popup } from '../_shared/Popup'
import styles from './Header/Header.module.scss'
import { ProfilePopup } from './ProfilePopup'

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
  const { session, author, isSessionLoaded } = useSession()
  const { unreadNotificationsCount, showNotificationsPanel } = useNotifications()
  const { form, toggleEditorPanel, saveShout, saveDraft, publishShout } = useEditorContext()

  const handleBellIconClick = (event: Event) => {
    event.preventDefault()

    if (!author()?.id) {
      showModal('auth')
      return
    }

    showNotificationsPanel()
  }

  const isEditorPage = createMemo(() => page().route === 'edit' || page().route === 'editSettings')
  const isNotificationsVisible = createMemo(() => author()?.id && !isEditorPage())
  const isSaveButtonVisible = createMemo(() => author()?.id && isEditorPage())
  const isCreatePostButtonVisible = createMemo(() => !isEditorPage())
  const isAuthenticatedControlsVisible = createMemo(() => author()?.id && session()?.user?.email_verified)

  const handleBurgerButtonClick = () => {
    toggleEditorPanel()
  }

  const _handleSaveClick = () => {
    const hasTopics = form.selectedTopics?.length > 0
    if (hasTopics) {
      saveShout(form)
    } else {
      saveDraft(form)
    }
  }

  const [width, setWidth] = createSignal(0)
  const [editorMode, setEditorMode] = createSignal(t('Editing'))

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
            <Show when={isCreatePostButtonVisible() && author()?.id}>
              <div
                class={clsx(
                  styles.userControlItem,
                  styles.userControlItemVerbose,
                  // styles.userControlItemCreate,
                )}
              >
                <a href={getPagePath(router, 'create')}>
                  <span class={styles.textLabel}>{t('Create post')}</span>
                  <Icon name="pencil-outline" class={styles.icon} />
                  <Icon name="pencil-outline-hover" class={clsx(styles.icon, styles.iconHover)} />
                </a>
              </div>
            </Show>

            <Show when={!isSaveButtonVisible()}>
              <div class={clsx(styles.userControlItem, styles.userControlItemSearch)}>
                <a href="?m=search">
                  <Icon name="search" class={styles.icon} />
                  <Icon name="search" class={clsx(styles.icon, styles.iconHover)} />
                </a>
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
              <Popup
                trigger={
                  <span class={styles.editorModePopupOpener}>
                    <Icon name="swiper-r-arr" class={styles.editorModePopupOpenerIcon} />
                    {editorMode()}
                  </span>
                }
                variant="bordered"
                popupCssClass={styles.editorPopup}
              >
                <ul class={clsx('nodash', styles.editorModesList)}>
                  <li
                    class={clsx({ [styles.editorModesSelected]: editorMode() === t('Preview') })}
                    onClick={() => setEditorMode(t('Preview'))}
                  >
                    <Icon name="eye" class={styles.editorModeIcon} />
                    <div class={styles.editorModeTitle}>{t('Preview')}</div>
                    <div class={styles.editorModeDescription}>
                      Посмотрите, как материал будет выглядеть при публикации
                    </div>
                  </li>
                  <li
                    class={clsx({ [styles.editorModesSelected]: editorMode() === t('Editing') })}
                    onClick={() => setEditorMode(t('Editing'))}
                  >
                    <Icon name="pencil-outline" class={styles.editorModeIcon} />
                    <div class={styles.editorModeTitle}>{t('Editing')}</div>
                    <div class={styles.editorModeDescription}>Изменяйте текст напрямую в редакторе</div>
                  </li>
                  <li
                    class={clsx({ [styles.editorModesSelected]: editorMode() === t('Commenting') })}
                    onClick={() => setEditorMode(t('Commenting'))}
                  >
                    <Icon name="comment" class={styles.editorModeIcon} />
                    <div class={styles.editorModeTitle}>{t('Commenting')}</div>
                    <div class={styles.editorModeDescription}>
                      Предлагайте правки и комментарии, чтобы сделать материал лучше
                    </div>
                  </li>
                </ul>
              </Popup>

              <div class={clsx(styles.userControlItem, styles.userControlItemVerbose)}>
                {renderIconedButton({
                  value: t('Publish'),
                  icon: 'publish',
                  action: () => publishShout(form),
                })}
              </div>

              <div
                class={clsx(
                  styles.userControlItem,
                  styles.settingsControlContainer,
                  styles.userControlItemVerbose,
                )}
              >
                <Popover content={t('Settings')}>
                  {(ref) => (
                    <Button
                      ref={ref}
                      value={<Icon name="ellipsis" />}
                      variant={'light'}
                      onClick={handleBurgerButtonClick}
                      class={styles.settingsControl}
                    />
                  )}
                </Popover>
              </div>
            </Show>

            <Show when={isCreatePostButtonVisible() && !author()?.id}>
              <div
                class={clsx(
                  styles.userControlItem,
                  styles.userControlItemVerbose,
                  // styles.userControlItemCreate,
                )}
              >
                <a href={getPagePath(router, 'create')}>
                  <span class={styles.textLabel}>{t('Create post')}</span>
                  <Icon name="pencil-outline" class={styles.icon} />
                  <Icon name="pencil-outline-hover" class={clsx(styles.icon, styles.iconHover)} />
                </a>
              </div>
            </Show>

            <Show
              when={isAuthenticatedControlsVisible()}
              fallback={
                <Show when={!author()?.id}>
                  <div class={clsx(styles.userControlItem, styles.userControlItemVerbose, 'loginbtn')}>
                    <a href="?m=auth&mode=login">
                      <span class={styles.textLabel}>{t('Enter')}</span>
                      <Icon name="key" class={styles.icon} />
                      <Icon name="key" class={clsx(styles.icon, styles.iconHover)} />
                    </a>
                  </div>
                </Show>
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
            </Show>
          </div>

          <Show when={author()?.id}>
            <ProfilePopup
              onVisibilityChange={(isVisible) => {
                props.setIsProfilePopupVisible(isVisible)
              }}
              containerCssClass={styles.control}
              trigger={
                <div class={clsx(styles.userControlItem, styles.userControlItemUserpic)}>
                  <button class={styles.button}>
                    <div classList={{ entered: page().path === `/${author()?.slug}` }}>
                      <Userpic
                        size={'L'}
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
      </Show>
    </ShowOnlyOnClient>
  )
}
