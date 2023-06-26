import { KeenSliderPlugin } from 'keen-slider'

export const Mutation: KeenSliderPlugin = (slider) => {
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      console.log('!!! update:')
      slider.update()
    })
  })
  const config = { childList: true }
  slider.on('created', () => {
    observer.observe(slider.container, config)
  })
  slider.on('destroyed', () => {
    observer.disconnect()
  })
}
