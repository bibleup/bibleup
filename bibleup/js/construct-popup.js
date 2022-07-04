export default class ConstructPopup {
  static build (options) {
    const popup = document.createElement('div')
    popup.id = 'bu-popup'
    popup.classList.add('bu-popup-hide', 'bu-ignore')
    const popupStyle = options.popup
    const darkTheme = options.darkTheme

    // Accessibility
    popup.setAttribute('role', 'dialog')
    popup.setAttribute(
      'aria-description',
      'A non-modal popup showing the text of Bible reference clicked on'
    )

    if (popupStyle === 'classic') {
      popup.classList.add('bu-classic')
      popup.innerHTML = this.classic()
    }

    if (popupStyle === 'inline') {
      popup.classList.add('bu-inline')
      popup.innerHTML = this.inline()
    }

    if (popupStyle === 'wiki') {
      popup.classList.add('bu-wiki')
      popup.innerHTML = this.wiki()
    }

    if (darkTheme === true) {
      popup.classList.add('bu-theme-dark')
    }

    document.body.appendChild(popup)
  }

  // bu-popup-ref/version/header/content/text/footer

  static classic () {
    const markup = `
		<div id='bu-popup-header'>
		<p id='bu-popup-ref'></p>
		<p id="bu-popup-version"></p>
		</div>
		
		<div id='bu-popup-content'>
			<ol id='bu-popup-text'></ol>
		</div>
		
		<div id='bu-popup-footer'>
			<p>BibleUp 📖💡 </p>
		</div>
		`
    return markup
  }

  static wiki () {
    const markup = `
	 <div id='bu-popup-header'>
	  <p id='bu-popup-ref'></p>
	  <span id='bu-popup-version'></span>
	  <button id='bu-popup-close' tabindex='0'>&#x2715</button>
	 </div> 
	 
	 <div id='bu-popup-content'>
	 	<ol id='bu-popup-text'></ol> 
	 </div>
	  
	 <div id='bu-popup-footer'>
	 	<p>BibleUp 📖💡 </p> 
	 </div>`

    return markup
  }

  static inline () {
    const markup = `
		<div id='bu-popup-content'>
  			<ol id='bu-popup-text'></ol>
  		</div>
 
 		<div id='bu-popup-footer'>
  			<p>BibleUp 📖💡 </p>
 		</div>`

    return markup
  }
}
