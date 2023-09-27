import MD from 'markdown-it'
import mdfig from 'markdown-it-implicit-figures'
import mdmark from 'markdown-it-mark'
import mdcustom from 'markdown-it-container'
import mdlinks from 'markdown-it-replace-link'
import { createMemo } from 'solid-js'

const mit = MD({
  html: true,
  linkify: true,
  typographer: true
})
mit.use(mdmark)
mit.use(mdcustom)
mit.use(mdfig, {
  dataType: false, // <figure data-type="image">
  figcaption: true // <figcaption>alternative text</figcaption>
})
mit.use(mdlinks)

export default (props: { body: string }) => {
  const body = createMemo(() => (props.body.startsWith('<') ? props.body : mit.render(props.body)))
  return <div innerHTML={body()} />
}
