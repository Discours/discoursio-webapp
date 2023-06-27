import 'solid-js'
import type { SwiperSlide, SwiperContainer } from 'swiper/element/bundle'

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'swiper-container': any
      'swiper-slide': any
    }
  }
}
