export function createTooltip(referenceElement?: Element, tooltipElement?: HTMLElement, options = {}) {
  const defaultOptions = {
    placement: 'top',
    offset: [0, 8]
  }
  const config = { ...defaultOptions, ...options }

  function updatePosition() {
    if (!(referenceElement && tooltipElement)) return

    const rect = referenceElement.getBoundingClientRect()
    const tooltipRect = tooltipElement.getBoundingClientRect()
    const offsetX = config.offset[0]
    const offsetY = config.offset[1]

    let top = 0
    let left = 0

    switch (config.placement) {
      case 'top': {
        top = rect.top - tooltipRect.height - offsetY
        left = rect.left + (rect.width - tooltipRect.width) / 2 + offsetX
        break
      }
      case 'bottom': {
        top = rect.bottom + offsetY
        left = rect.left + (rect.width - tooltipRect.width) / 2 + offsetX
        break
      }
      case 'left': {
        top = rect.top + (rect.height - tooltipRect.height) / 2 + offsetY
        left = rect.left - tooltipRect.width - offsetX
        break
      }
      case 'right': {
        top = rect.top + (rect.height - tooltipRect.height) / 2 + offsetY
        left = rect.right + offsetX
        break
      }
      default: {
        top = rect.top - tooltipRect.height - offsetY
        left = rect.left + (rect.width - tooltipRect.width) / 2 + offsetX
      }
    }

    tooltipElement.style.position = 'absolute'
    tooltipElement.style.top = `${top}px`
    tooltipElement.style.left = `${left}px`
  }

  function showTooltip() {
    if (tooltipElement) tooltipElement.style.visibility = 'visible'
    updatePosition()
  }

  function hideTooltip() {
    if (tooltipElement) tooltipElement.style.visibility = 'hidden'
  }

  referenceElement?.addEventListener('mouseenter', showTooltip)
  referenceElement?.addEventListener('mouseleave', hideTooltip)
  window.addEventListener('resize', updatePosition)

  return {
    update: updatePosition,
    destroy() {
      referenceElement?.removeEventListener('mouseenter', showTooltip)
      referenceElement?.removeEventListener('mouseleave', hideTooltip)
      window.removeEventListener('resize', updatePosition)
    }
  }
}

// Usage example
const referenceElement = document.querySelector('#reference')
const tooltipElement = document.querySelector('#tooltip')
createTooltip(referenceElement as HTMLElement, tooltipElement as HTMLElement, {
  placement: 'top',
  offset: [0, 8]
})
