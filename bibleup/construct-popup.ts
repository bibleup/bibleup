import { Options, Popup } from './helper/interfaces'

export const build = (options: Options, buid: string): Popup => {
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

  switch (popupStyle) {
    case 'classic':
      popup.classList.add('bu-classic')
      popup.innerHTML = classic()
      break
    case 'inline':
      popup.classList.add('bu-inline')
      popup.innerHTML = inline()
      break
    case 'wiki':
      popup.classList.add('bu-wiki')
      popup.innerHTML = wiki()
      break
  }

  if (darkTheme === true) {
    popup.setAttribute('data-bu-theme', 'dark')
  }

  document.body.appendChild(popup)
  return referenceDOM(buid);
}

const referenceDOM = (buid: string) => {
  return {
    container: document.getElementById(
      `bu-popup-${buid}`
    ) as HTMLElement,
    header: document.querySelector(
      `#bu-popup-${buid} .bu-popup-header`
    ) as HTMLElement,
    ref: document.querySelector(`#bu-popup-${buid} .bu-popup-ref`)  as HTMLElement,
    version: document.querySelector(
      `#bu-popup-${buid} .bu-popup-version`
    ) as HTMLElement,
    content: document.querySelector(
      `#bu-popup-${buid} .bu-popup-content`
    ) as HTMLElement,
    text: document.querySelector(
      `#bu-popup-${buid} .bu-popup-text`
    ) as HTMLElement,
    close:
      document.querySelector(`#bu-popup-${buid} .bu-popup-close`) as HTMLElement ||
      null
  }
}

const classic = (): string => {
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

const wiki = (): string => {
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

const inline = (): string => {
  const markup = `
		<div class='bu-popup-content'>
  			<ol class='bu-popup-text'></ol>
  		</div>

 		<div class='bu-popup-footer'>
  			<p>BibleUp 📖💡 </p>
 		</div>`

  return markup
}
