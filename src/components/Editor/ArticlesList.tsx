import './ArticlesList.scss'

export default () => {
  return (
    <div class="articles-list">
      <div class="articles-list__item article row">
        <div class="col-md-6">
          <div class="article__status article__status--draft">Черновик</div>
          <div class="article__title">
            <strong>Поствыживание. Комплекс вины и&nbsp;кризис самооценки в&nbsp;дивном новом мире.</strong>{' '}
            В&nbsp;летописи российского музыкального подполья остаётся множество лакун.
          </div>
          <time class="article__date">21 марта 2022</time>
        </div>
        <div class="article__controls col-md-5 offset-md-1">
          <div class="article-control">Редактировать</div>
          <div class="article-control">Опубликовать</div>
          <div class="article-control article-control--remove">Удалить</div>
        </div>
      </div>
    </div>
  )
}
