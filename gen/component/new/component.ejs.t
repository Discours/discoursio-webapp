---
to: src/components/<%= h.changeCase.pascal(name) %>/<%= h.changeCase.pascal(name) %>.tsx
---

import { clsx } from 'clsx'
import styles from './<%= h.changeCase.pascal(name) %>.module.scss'

type Props = {
  class?: string
}

export const <%= h.changeCase.pascal(name) %> = (props: Props) => {
  return (
    <div class={clsx(styles.<%= h.changeCase.pascal(name) %>, props.class)}>
      <%= h.changeCase.pascal(name) %>
    </div>
  )
}
