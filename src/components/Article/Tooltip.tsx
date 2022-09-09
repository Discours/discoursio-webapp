import './Tooltip.scss'
import { createSignal } from 'solid-js'

export const Tooltip: (p: any) => any = (props: any) => {
  const [isShown, setShowed] = createSignal(false)
  const show = () => setShowed(true)
  return (
    <span>
      <a href={props.link || '#'} class="tooltip" onClick={show}>
        &zwnj;
      </a>
      <div class="tooltip-content" classList={{ hidden: !isShown() }}>
        {props.children}
      </div>
    </span>
  )
}

export default Tooltip
