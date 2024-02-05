import 'solid-js'
import { AutoplayOptions, SwiperOptions } from 'swiper'
import { SwiperSlideProps } from 'swiper/react'

type Kebab<T extends string, A extends string = ''> = T extends `${infer F}${infer R}`
  ? Kebab<R, `${A}${F extends Lowercase<F> ? '' : '-'}${Lowercase<F>}`>
  : A

/**
 * Helper for converting object keys to kebab case because Swiper web components parameters are available as kebab-case attributes.
 * @link https://swiperjs.com/element#parameters-as-attributes
 */
type KebabObjectKeys<T> = {
  // biome-ignore lint/suspicious/noExplicitAny: TODO: <explanation>
  [key in keyof T as Kebab<key & string>]: T[key] extends Record<string, any>
    ? KebabObjectKeys<T[key]>
    : T[key]
}

/**
 * Swiper 9 doesn't support Typescript yet, we are watching the following issue:
 * @link https://github.com/nolimits4web/swiper/issues/6466
 *
 * All parameters can be found on the following page:
 * @link https://swiperjs.com/swiper-api#parameters
 */
type SwiperRef = HTMLElement & { swiper: Swiper; initialize: () => void }

declare module 'solid-js' {
  // biome-ignore lint/style/useNamingConvention: JSX is ok
  // biome-ignore lint/style/noNamespace: TODO: explain why
  namespace JSX {
    interface IntrinsicElements {
      'swiper-container': SwiperContainerAttributes
      'swiper-slide': SwiperSlideAttributes
    }

    interface SwiperContainerAttributes extends KebabObjectKeys<SwiperOptions> {
      ref?: RefObject<SwiperRef>
      children?: JSX.Element
      onSlideChange?: () => void
      onBeforeSlideChangeStart?: () => void
      class?: string
      observer?: boolean
      loop?: boolean
      speed?: number
      slidesPerGroupAuto?: boolean
      navigation?: boolean
      breakpoints?: {
        [width: number]: SwiperOptions
        [ratio: string]: SwiperOptions
      }
      direction?: 'horizontal' | 'vertical'
      autoplay?: AutoplayOptions | boolean
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface SwiperSlideAttributes extends KebabObjectKeys<SwiperSlideProps> {
      style?: unknown
    }
  }
}
