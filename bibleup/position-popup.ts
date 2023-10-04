/**
 * positionPopup() calls positional codes for popup and sets the popup new positions
 * - NOTE - the popup dimensions(height, width) can only be gotten when using 'visibility:hidden' and not
 * 'display:none'
 */

export const positionPopup = (
  e: MouseEvent,
  popup: string,
  container: HTMLElement
) => {
  const el = getPosition(e, container)
  if (popup === 'inline') {
    el.popWidth += 10
  }
  if (popup !== 'wiki') {
    adjustPopupToLeft(container, [el.width, el.rectLeft, el.popWidth])
    adjustPopupToBottom(container, [
      el.height,
      el.rectBottom,
      el.popHeight,
      el.realTop,
      el.rect.height
    ])
  }
}

/**
 * Adjust popup to left or right of click
 */
const adjustPopupToLeft = (el: HTMLElement, pos: number[]) => {
  const [width, rectLeft, popWidth] = pos
  const remainingSpace = width - rectLeft

  if (remainingSpace > popWidth) {
    if (rectLeft < 0) {
      el.style.left = `${0}px`
    } else {
      el.style.left = `${rectLeft}px`
    }
  } else {
    const offsetBy = popWidth - remainingSpace
    const adjust = rectLeft - offsetBy
    el.style.left = `${adjust}px`
  }
}

/**
 * Adjust popup to bottom or top of link according to space remaining
 * - Popup appears on top of link by default and fallbacks to bottom if there is no space.
 */
const adjustPopupToBottom = (el: HTMLElement, pos: number[]) => {
  const [height, rectBottom, popHeight, realTop, rectHeight] = pos
  const bottomSpace = height - rectBottom
  const topSpace = height - bottomSpace

  if (topSpace > popHeight + 50) {
    const adjust = realTop - popHeight
    el.style.top = `${adjust - 5}px`
  } else {
    el.style.top = `${realTop + (rectHeight + 5)}px`
  }
}

const getPosition = (e: MouseEvent, container: HTMLElement) => {
  // get window dimensions
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  const popup = container
  const rectTop = rect.top

  return {
    rect,
    rectTop,
    height: window.innerHeight,
    width: document.documentElement.clientWidth,
    popWidth: popup.offsetWidth,
    popHeight: popup.offsetHeight,
    rectBottom: rect.bottom,
    rectLeft: Math.round(rect.left),
    realTop: window.scrollY + rectTop
  }
}
