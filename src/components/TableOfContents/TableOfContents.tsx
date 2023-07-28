import { createEffect, For, Show, createSignal } from 'solid-js'
import { clsx } from 'clsx'

import { useLocalize } from '../../context/localize'

import { Icon } from '../_shared/Icon'

import styles from './TableOfContents.module.scss'

interface TableOfContentsProps {
  type: 'article' | 'editor'
  content: string
}

export const TableOfContents = (props: TableOfContentsProps) => {
  const { t } = useLocalize()

  const [headings, setHeadings] = createSignal<Element[]>([])
  const [areHeadingsLoaded, setAreHeadingsLoaded] = createSignal<boolean>(false)

  const [isVisible, setIsVisible] = createSignal<boolean>(true)
  const toggleIsVisible = () => {
    setIsVisible((visible) => !visible)
  }

  const scrollToHeader = (id) => {
    if (props.type !== 'editor') {
      window.scrollTo({
        behavior: 'smooth',
        top:
          document.getElementById(id).getBoundingClientRect().top -
          document.body.getBoundingClientRect().top -
          70
      })
    }
  }

  createEffect(() => {
    if (props.content) {
      const parser = new window.DOMParser()
      const htmlDoc = parser.parseFromString(props.content, 'text/html')

      setHeadings(Array.from(htmlDoc.querySelectorAll('h2, h3, h4')))
      setAreHeadingsLoaded(true)
    }
  }, props.content)

  return (
    <Show when={headings().length}>
      <div
        class={clsx(
          styles.TableOfContentsFixedWrapper,
          props.type === 'editor' && styles.TableOfContentsFixedWrapperLefted
        )}
      >
        <div class={styles.TableOfContentsContainer}>
          <Show when={isVisible()}>
            <header class={styles.TableOfContentsHeader}>
              <p class={styles.TableOfContentsHeading}>{t('Table of contents')}</p>
            </header>
            <Show when={areHeadingsLoaded()} fallback={<div>...Loading headings</div>}>
              <ul class={styles.TableOfContentsHeadingsList}>
                <For each={headings()}>
                  {(h) => {
                    return (
                      <li>
                        <button
                          class={clsx(
                            styles.TableOfContentsHeadingsItem,
                            h.nodeName === 'H3' && styles.TableOfContentsHeadingsItemH3,
                            h.nodeName === 'H4' && styles.TableOfContentsHeadingsItemH4
                          )}
                          innerHTML={h.textContent}
                          onClick={(e) => {
                            e.preventDefault()

                            scrollToHeader(h.getAttribute('id'))
                          }}
                        ></button>
                      </li>
                    )
                  }}
                </For>

                {/* <Show when={props.type !== 'editor'}>
                  <div class={styles.TableOfContentsScrolledIndicator} />
                </Show> */}
              </ul>
            </Show>
          </Show>

          <button
            class={clsx(
              styles.TableOfContentsPrimaryButton,
              props.type === 'editor' && !isVisible() && styles.TableOfContentsPrimaryButtonLefted
            )}
            onClick={(e) => {
              e.preventDefault()

              toggleIsVisible()
            }}
          >
            <Show when={isVisible()} fallback={<Icon name="show-table-of-contents" class={'icon'} />}>
              <Icon
                name="hide-table-of-contents"
                class={clsx('icon', props.type === 'editor' && styles.TableOfContentsIconRotated)}
              />
            </Show>
          </button>
        </div>
      </div>
    </Show>
  )
}
