export function createTooltip(referenceElement?: Element, tooltipElement?: HTMLElement, options = {}) {
  const defaultOptions = {
    placement: 'top',
    offset: [0, 8],
    flip: {
      fallbackPlacements: ['top', 'bottom']
    }
  }
  const config = { ...defaultOptions, ...options }

  function updatePosition() {
    if (!(referenceElement && tooltipElement)) return

    const rect = referenceElement.getBoundingClientRect()
    const tooltipRect = tooltipElement.getBoundingClientRect()
    const offsetX = config.offset[0]
    const offsetY = config.offset[1]

    let placement = config.placement
    let top = 0
    let left = 0

    // Базовое позиционирование
    switch (placement) {
      case 'top':
        top = rect.top - tooltipRect.height - offsetY
        left = rect.left + (rect.width - tooltipRect.width) / 2 + offsetX
        break
      case 'bottom':
        top = rect.bottom + offsetY
        left = rect.left + (rect.width - tooltipRect.width) / 2 + offsetX
        break
      // Добавьте case для 'left' и 'right', если необходимо
    }

    // Проверка на выход за границы окна и применение flip
    if (top < 0 && config.flip.fallbackPlacements.includes('bottom')) {
      top = rect.bottom + offsetY
      placement = 'bottom'
    } else if (top + tooltipRect.height > window.innerHeight && config.flip.fallbackPlacements.includes('top')) {
      top = rect.top - tooltipRect.height - offsetY
      placement = 'top'
    }

    // Применение позиции
    tooltipElement.style.position = 'absolute'
    tooltipElement.style.top = `${top}px`
    tooltipElement.style.left = `${left}px`
    tooltipElement.style.visibility = 'visible'

    // Обновление класса для стрелки
    tooltipElement.setAttribute('data-popper-placement', placement)

    // Позиционирование стрелки
    const arrow = tooltipElement.querySelector('[data-popper-arrow]') as HTMLElement
    if (arrow) {
      const arrowRect = arrow.getBoundingClientRect()
      if (placement === 'top') {
        arrow.style.bottom = '-4px'
        arrow.style.left = `${tooltipRect.width / 2 - arrowRect.width / 2}px`
      } else if (placement === 'bottom') {
        arrow.style.top = '-4px'
        arrow.style.left = `${tooltipRect.width / 2 - arrowRect.width / 2}px`
      }
    }
  }

  function showTooltip() {
    if (tooltipElement) {
      tooltipElement.style.visibility = 'visible'
      updatePosition()
    }
  }

  function hideTooltip() {
    if (tooltipElement) tooltipElement.style.visibility = 'hidden'
  }

  referenceElement?.addEventListener('mouseenter', showTooltip)
  referenceElement?.addEventListener('mouseleave', hideTooltip)
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition)

  return {
    update: updatePosition,
    destroy() {
      referenceElement?.removeEventListener('mouseenter', showTooltip)
      referenceElement?.removeEventListener('mouseleave', hideTooltip)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }
}