import { JSX } from 'solid-js'

type Props = {
  condition: boolean
  wrapper: (children: JSX.Element) => JSX.Element
  children: JSX.Element
}

export const ConditionalWrapper = (props: Props) => {
  return props.condition ? props.wrapper(props.children) : props.children
}
