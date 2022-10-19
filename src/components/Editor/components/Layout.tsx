import { Config } from '../store/context'
import '../styles/Layout.scss'

export type Styled = {
  children: any;
  config?: Config;
  'data-testid'?: string;
  onClick?: () => void;
  onMouseEnter?: (e: any) => void;
}

export const Layout = (props: Styled) => {
  return (<div onMouseEnter={props.onMouseEnter} class='layout' data-testid={props['data-testid']}>
    {props.children}
  </div>)
}
