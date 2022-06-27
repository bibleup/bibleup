/**
 * positionPopup() calls positional codes for the type of popup and sets the popup new positions
 * NOTE - the popup dimensions(height, width) can only be gotten when using 'visibility:hidden' and not
 * 'display:none'
 * use classic() to set position on custom syled popups
 */

let positionPopup = (e, popup) => {
  if (popup == 'classic') {
    classic(e);
  }
  if (popup == 'inline') {
    inline(e);
  }
  return false;
};

/**
 * Adjust popup to left or right of click
 */
let adjustPopupToLeft = (pos) => {
  let [width, rectLeft, popup, popWidth] = pos;
  let remainingSpace = width - rectLeft;

  if (remainingSpace > popWidth) {
    popup.style.left = `${rectLeft + 'px'}`;
    if (rectLeft < 0) {
      popup.style.left = `${0 + 'px'}`;
    }
  } else {
    let offsetBy = popWidth - remainingSpace;
    let adjust = rectLeft - offsetBy;
    popup.style.left = `${adjust + 'px'}`;
  }
};

/**
 * adjust popup to bottom or top of link according to space remaining
 * Popup positions to top of link by default and fallbacks to bottom if there is no space.
 */
let adjustPopupToBottom = (pos) => {
  let [height, rectBottom, popup, popHeight, realTop, rectHeight] = pos;
  let bottomSpace = height - rectBottom;
  let topSpace = height - bottomSpace;

  if (topSpace > popHeight + 50) {
    let adjust = realTop - popHeight;
    popup.style.top = `${adjust - 5 + 'px'}`;
  } else {
    console.log(rectHeight);
    popup.style.top = `${realTop + (20 + 5) + 'px'}`;
  }
};

let getPosition = (e) => {
  //get window dimensions
  let rect = e.target.getBoundingClientRect();
  let popup = document.getElementById('bu-popup');
  let rectTop = rect.top;

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
    realTop: window.scrollY + rectTop,
  };
};

let classic = (e) => {
  let el = getPosition(e);
  adjustPopupToLeft([el.width, el.rectLeft, el.popup, el.popWidth]);
  adjustPopupToBottom([el.height, el.rectBottom, el.popup, el.popHeight, el.realTop]);
};

let inline = (e) => {
  let el = getPosition(e);
  el.popWidth += 10;
  adjustPopupToLeft([el.width, el.rectLeft, el.popup, el.popWidth]);
  adjustPopupToBottom([el.height, el.rectBottom, el.popup, el.popHeight, el.realTop]);
};

export default positionPopup;
