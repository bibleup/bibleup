**BIBLEUP DOCUMENTATION (v1.0.0)** 📖💡
- [x] Delay popup dissapearance when mouse leaves link. This helps to prevent quick dissappearance when mouse jitters away from link
- [] reduce popup full height
- [] enable reference-level version tagging
- [] add z-index to popup. Popup hides behind some element.
- [x] Popup shouldn't show 'loading' again when mouse quickly jitters out of link and comes in again but popup is already open

- [] prevent popup position 'flickers'. This happens because popup position is recalculated after text has loaded and based on the remaining height of screen and new height of popup the popup might change position really fast causing the flicker.