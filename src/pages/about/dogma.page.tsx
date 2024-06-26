import { Meta } from '../../context/meta'

import { StaticPage } from '../../components/Views/StaticPage'
import { useLocalize } from '../../context/localize'
import { getImageUrl } from '../../utils/getImageUrl'

export const DogmaPage = () => {
  const { t } = useLocalize()

  const ogImage = getImageUrl('production/image/logo_image.png')
  const ogTitle = t('Dogma')
  const description = t('Professional principles that the open editorial team follows in its work')

  return (
    <StaticPage title={ogTitle}>
      <Meta name="descprition" content={description} />
      <Meta name="keywords" content={t('dogma keywords')} />
      <Meta name="og:type" content="article" />
      <Meta name="og:title" content={ogTitle} />
      <Meta name="og:image" content={ogImage} />
      <Meta name="twitter:image" content={ogImage} />
      <Meta name="og:description" content={description} />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={ogTitle} />
      <Meta name="twitter:description" content={description} />

      <h1>
        <span class="wrapped">Редакционные принципы</span>
      </h1>

      <p>
        Дискурс — журнал с открытой горизонтальной редакцией. Содержание журнала определяется прямым
        голосованием его авторов. Мы нередко занимаем различные позиции по разным проблемам, но
        придерживаемся общих профессиональных принципов:
      </p>
      <ol>
        <li>
          <b>На первое место ставим факты.</b> Наша задача — не судить, а наблюдать и непредвзято
          фиксировать происходящее. Все утверждения и выводы, которые мы делаем, подтверждаются фактами,
          цифрами, мнениями экспертов или ссылками на авторитетные источники.
        </li>
        <li>
          <b>Ответственно относимся к источникам.</b>
          Мы выбираем только надежные источники, проверяем информацию и рассказываем, как и откуда мы её
          получили, кроме случаев, когда это может нанести вред источникам. Тогда мы не раскроем их, даже в
          суде.
        </li>
        <li>
          <b>Выбираем компетентных и независимых экспертов</b>, понимая всю степень ответственности перед
          аудиторией.
        </li>
        <li>
          <b>
            Даем возможность высказаться всем заинтересованным сторонам, но не присоединяемся ни к чьему
            лагерю.
          </b>
          Ко всем событиям, компаниям и людям мы относимся с одинаковым скептицизмом.
        </li>
        <li>
          <b>Всегда исправляем ошибки, если мы их допустили.</b>
          Никто не безгрешен, иногда и мы ошибаемся. Заметили ошибку — отправьте{' '}
          <a href="/about/guide#editing">ремарку</a> автору или напишите нам на{' '}
          <a href="mailto:welcome@discours.io" target="_blank" rel="noreferrer">
            welcome@discours.io
          </a>
          .
        </li>
      </ol>
    </StaticPage>
  )
}

export const Page = DogmaPage
