import type { JSX } from 'solid-js/jsx-runtime'
import { Switch, Match } from 'solid-js'

type Props = {
  level?: number
  children: JSX.Element
}

const CommentWrapper = (props: Props) => {
  return (
    <Switch fallback={props.children}>
      <Match when={props.level === 1}>
        <ul>{props.children}</ul>
      </Match>
      <Match when={props.level === 2}>
        <ul>
          <li>
            <ul>{props.children}</ul>
          </li>
        </ul>
      </Match>
      <Match when={props.level === 3}>
        <ul>
          <li>
            <ul>
              <li>
                <ul>{props.children}</ul>
              </li>
            </ul>
          </li>
        </ul>
      </Match>
      <Match when={props.level === 4}>
        <ul>
          <li>
            <ul>
              <li>
                <ul>
                  <li>
                    <ul>{props.children}</ul>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </Match>
      <Match when={props.level === 5}>
        <ul>
          <li>
            <ul>
              <li>
                <ul>
                  <li>
                    <ul>
                      <li>
                        <ul>{props.children}</ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </Match>
    </Switch>
  )
}

export default CommentWrapper
