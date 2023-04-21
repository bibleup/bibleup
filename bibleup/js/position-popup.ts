/**
 * positionPopup() calls positional codes for the type of popup and sets the popup new positions
 * NOTE - the popup dimensions(height, width) can only be gotten when using 'visibility:hidden' and not
 * 'display:none'
 * use classic() to set position on custom syled popups
 */

export const positionPopup = (e: MouseEvent, popup: string, container: HTMLElement) => {
  if (popup === 'classic') {
    classic(e, container)
  }
  if (popup === 'inline') {
    inline(e, container)
  }
  return false
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
 * adjust popup to bottom or top of link according to space remaining
 * Popup positions to top of link by default and fallbacks to bottom if there is no space.
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
    popup,
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

const classic = (e: MouseEvent, container: HTMLElement) => {
  const el = getPosition(e, container)
  adjustPopupToLeft(el.popup, [el.width, el.rectLeft, el.popWidth])
  adjustPopupToBottom(el.popup, [el.height, el.rectBottom, el.popHeight, el.realTop, el.rect.height])
}

const inline = (e: MouseEvent, container: HTMLElement) => {
  const el = getPosition(e, container)
  el.popWidth += 10
  adjustPopupToLeft(el.popup, [el.width, el.rectLeft, el.popWidth])
  adjustPopupToBottom(el.popup, [el.height, el.rectBottom, el.popHeight, el.realTop, el.rect.height])
}
