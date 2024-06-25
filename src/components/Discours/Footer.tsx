import { clsx } from 'clsx'
import { For, createMemo } from 'solid-js'

import { useLocalize } from '../../context/localize'
import { Icon } from '../_shared/Icon'
import { Newsletter } from '../_shared/Newsletter'

import styles from './Footer.module.scss'

export const Footer = () => {
  const { t, lang } = useLocalize()

  const changeLangTitle = createMemo(() => (lang() === 'ru' ? 'English' : 'Русский'))
  const changeLangLink = createMemo(() => `?lng=${lang() === 'ru' ? 'en' : 'ru'}`)
  const links = createMemo(() => [
    {
      header: t('About the project'),
      items: [
        {
          title: t('Discours Manifest'),
          slug: '/about/manifest',
        },
        {
          title: t('How it works'),
          slug: '/about/guide',
        },
        {
          title: t('Dogma'),
          slug: '/about/dogma',
        },
        {
          title: t('Principles'),
          slug: '/about/principles',
        },
        {
          title: t('How to write an article'),
          slug: '/how-to-write-a-good-article',
        },
      ],
    },

    {
      header: t('Participating'),
      items: [
        {
          title: t('Suggest an idea'),
          slug: '/connect',
        },
        {
          title: t('Become an author'),
          slug: '/create',
        },
        {
          title: t('Support Discours'),
          slug: '/about/help',
        },
        {
          title: t('Work with us'),
          slug: 'https://docs.google.com/forms/d/e/1FAIpQLSeNNvIzKlXElJtkPkYiXl-jQjlvsL9u4-kpnoRjz1O8Wo40xQ/viewform',
        },
      ],
    },

    {
      header: t('Sections'),
      items: [
        {
          title: t('Authors'),
          slug: '/authors',
        },
        {
          title: t('Communities'),
          slug: '/community',
        },
        {
          title: t('Partners'),
          slug: '/about/partners',
        },
        {
          title: t('Special projects'),
          slug: '/about/projects',
        },
        {
          title: changeLangTitle(),
          slug: changeLangLink(),
          rel: 'external',
        },
      ],
    },
  ])

  const social = [
    {
      name: 'facebook',
      href: 'https://facebook.com/discoursio',
    },
    {
      name: 'vk',
      href: 'https://vk.com/discoursio',
    },
    {
      name: 'twitter',
      href: 'https://twitter.com/discours_io',
    },
    {
      name: 'telegram',
      href: 'https://t.me/discoursio',
    },
  ]
  return (
    <footer class={styles.discoursFooter}>
      <div class="wide-container">
        <div class="row">
          <For each={links()}>
            {({ header, items }) => (
              <div class="col-sm-8 col-md-6">
                <h5>{header}</h5>
                <ul>
                  <For each={items}>
                    {({ slug, title, ...rest }) => (
                      <li>
                        {' '}
                        <a href={slug} {...rest}>
                          {title}
                        </a>{' '}
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            )}
          </For>
          <div class="col-md-6">
            <h5>{t('Subscription')}</h5>
            <p>{t('Join our maillist')}</p>
            <Newsletter />
          </div>
        </div>

        <div class={clsx(styles.footerCopyright, 'row')}>
          <div class="col-md-18 col-lg-20">
            {t(
              'Independant magazine with an open horizontal cooperation about culture, science and society',
            )}
            . {t('Discours')} &copy; 2015&ndash;{new Date().getFullYear()}{' '}
            <a href="/about/terms-of-use">{t('Terms of use')}</a>
          </div>
          <div class={clsx(styles.footerCopyrightSocial, 'col-md-6 col-lg-4')}>
            <For each={social}>
              {(social) => {
                const styleKey = `socialItem${social.name}` as keyof typeof styles
                return (
                  <div class={clsx(styles.socialItem, styles[styleKey])}>
                    <a href={social.href}>
                      <Icon name={`${social.name}-white`} class={styles.icon} />
                    </a>
                  </div>
                )
              }}
            </For>
          </div>
        </div>
      </div>
    </footer>
  )
}
