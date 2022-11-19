const scrollPosition = {
  top: 0,
  left: 0
}

export const saveScrollPosition = () => {
  scrollPosition.top = window.scrollY
  scrollPosition.left = window.scrollX
}

export const restoreScrollPosition = () => {
  window.scroll({
    top: scrollPosition.top,
    left: scrollPosition.left
  })
}

export const scrollHandler = (elemId) => {
  const anchor = document.querySelector('#' + elemId)
  // console.debug(elemId)
  if (anchor) {
    window.scrollTo({
      top: anchor.getBoundingClientRect().top - 100,
      behavior: 'smooth'
    })
  }
}
