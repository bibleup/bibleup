
export const build = (options, buid) => {
  const popup = document.createElement('div')
  popup.id = `bu-popup-${buid}`
  popup.classList.add('bu-popup-hide', 'bu-ignore')
  const popupStyle = options.popup
  const darkTheme = options.darkTheme

  // Accessibility
  popup.setAttribute('role', 'dialog')
  popup.setAttribute(
    'aria-description',
    'A non-modal popover showing the text of Bible reference'
  )

  if (popupStyle === 'classic') {
    popup.classList.add('bu-classic')
    popup.innerHTML = classic()
  }

  if (popupStyle === 'inline') {
    popup.classList.add('bu-inline')
    popup.innerHTML = inline()
  }

  if (popupStyle === 'wiki') {
    popup.classList.add('bu-wiki')
    popup.innerHTML = wiki()
  }

  if (darkTheme === true) {
    popup.classList.add('bu-theme-dark')
  }

  document.body.appendChild(popup)
}

const classic = () => {
  const markup = `
		<div class='bu-popup-header'>
		<p class='bu-popup-ref'></p>
		<p class="bu-popup-version"></p>
		</div>

		<div class='bu-popup-content'>
			<ol class='bu-popup-text'></ol>
		</div>

		<div class='bu-popup-footer'>
			<p>BibleUp 📖💡 </p>
		</div>
		`
  return markup
}

const wiki = () => {
  const markup = `
	 <div class='bu-popup-header'>
	  <p class='bu-popup-ref'></p>
	  <span class='bu-popup-version'></span>
	  <button class='bu-popup-close' tabindex='0'>&#x2715</button>
	 </div>

	 <div class='bu-popup-content'>
	 	<ol class='bu-popup-text'></ol>
	 </div>

	 <div class='bu-popup-footer'>
	 	<p>BibleUp 📖💡 </p>
	 </div>`

  return markup
}

const inline = () => {
  const markup = `
		<div class='bu-popup-content'>
  			<ol class='bu-popup-text'></ol>
  		</div>

 		<div class='bu-popup-footer'>
  			<p>BibleUp 📖💡 </p>
 		</div>`

  return markup
}
