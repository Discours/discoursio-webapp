import style from './CardTopic.module.scss'

interface CardTopicProps {
  title: string
  slug: string
  isFloorImportant?: boolean
}

export const CardTopic = (props: CardTopicProps) => {
  return (
    <div
      class={style.shoutTopic}
      classList={{
        [style.shoutTopicFloorImportant]: props.isFloorImportant
      }}
    >
      <a href={`/topic/${props.slug}`}>{props.title}</a>
    </div>
  )
}
