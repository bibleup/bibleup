/**
 * positionPopup() calls positional codes for the type of popup and sets the popup new positions
 * NOTE - the popup dimensions(height, width) can only be gotten when using 'visibility:hidden' and not
 * 'display:none'
 * use classic() to set position on custom syled popups
 */

const positionPopup = (e, popup, container) => {
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
const adjustPopupToLeft = (pos) => {
  const [width, rectLeft, popup, popWidth] = pos
  const remainingSpace = width - rectLeft

  if (remainingSpace > popWidth) {
    if (rectLeft < 0) {
      popup.style.left = `${0 + 'px'}`
    } else {
      popup.style.left = `${rectLeft + 'px'}`
    }
  } else {
    const offsetBy = popWidth - remainingSpace
    const adjust = rectLeft - offsetBy
    popup.style.left = `${adjust + 'px'}`
  }
}

/**
 * adjust popup to bottom or top of link according to space remaining
 * Popup positions to top of link by default and fallbacks to bottom if there is no space.
 */
const adjustPopupToBottom = (pos) => {
  const [height, rectBottom, popup, popHeight, realTop, rectHeight] = pos
  const bottomSpace = height - rectBottom
  const topSpace = height - bottomSpace

  if (topSpace > popHeight + 50) {
    const adjust = realTop - popHeight
    popup.style.top = `${adjust - 5 + 'px'}`
  } else {
    popup.style.top = `${realTop + (rectHeight + 5) + 'px'}`
  }
}

const getPosition = (e, container) => {
  // get window dimensions
  const rect = e.target.getBoundingClientRect()
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

const classic = (e, container) => {
  const el = getPosition(e, container)
  adjustPopupToLeft([el.width, el.rectLeft, el.popup, el.popWidth])
  adjustPopupToBottom([el.height, el.rectBottom, el.popup, el.popHeight, el.realTop, el.rect.height])
}

const inline = (e, container) => {
  const el = getPosition(e, container)
  el.popWidth += 10
  adjustPopupToLeft([el.width, el.rectLeft, el.popup, el.popWidth])
  adjustPopupToBottom([el.height, el.rectBottom, el.popup, el.popHeight, el.realTop, el.rect.height])
}

export default positionPopup
