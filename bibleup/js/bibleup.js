import bibleData from './helper/bible-data.js'
import Bible from './helper/bible.js'
import ConstructPopup from './construct-popup.js'
import positionPopup from './position-popup.js'
import Search from './helper/search.js'

export default class BibleUp {
  // PRIVATE_FIELD
  #element
  #options
  #defaultOptions
  #regex
  #mouseOnPopup // if mouse is on popup
  #popupTimer
  #loadingTimer
  #currentRef // currently loading bible ref
  #activeLink // unique identifier of last clicked link
  #popup
  #ispopupOpen
  #events
  #inlineChapter
  #buid // unique bibleup instance key

  constructor (element, options) {
    this.#element = element
    this.#defaultOptions = {
      version: 'KJV',
      popup: 'classic',
      darkTheme: false,
      bu_ignore: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'IMG', 'A'],
      bu_allow: [],
      styles: {}
    }

    if (typeof options === 'object' && options !== null) {
      this.#options = { ...this.#defaultOptions, ...options }
    } else {
      this.#options = this.#defaultOptions
    }

    this.#buid = Math.floor(100000 + Math.random() * 999999)
    this.#init(this.#options)
    this.#regex = this.#generateRegex(bibleData)
    this.#mouseOnPopup = false
    this.#ispopupOpen = false

    this.#events = {
      clickHandler: this.#clickHandler.bind(this),
      closePopup: this.#closePopup.bind(this),
      exitPopup: this.#exitPopup.bind(this)
    }
  }

  /**
   * {type} getter
   * {return} all options for present class instance
   */
  get getOptions () {
    return this.#options
  }

  /**
   * {desc} class entry point.
   * create instances for entire app func
   *
   */
  create () {
    this.#searchNode(this.#element, this.#regex)
    this.#manageEvents(this.#options)
  }

  /**
     * This method destoys BibleUp creation and removes the links and popup from the page
     */
  destroy () {
    const links = document.querySelectorAll(`.bu-link-${this.#buid}`)
    for (const link of links) {
      link.closest('cite').replaceWith(...link.childNodes)
    }
    if (this.#popup.container) {
      this.#popup.container.remove()
    }
  }

  refresh (options = {}, element = this.#element) {
    const old = this.#options
    this.#options = { ...this.#defaultOptions, ...this.#options, ...options }
    const trigger = { version: false, popup: false, style: false }

    // set trigger version
    if (old.version !== this.#options.version) {
      trigger.version = true
    }

    // set trigger build popup
    if (old.popup !== this.#options.popup || old.darkTheme !== this.#options.darkTheme) {
      if (this.#popup.container) {
        this.#popup.container.remove()
      }
      trigger.popup = true
      trigger.style = true
    }

    // set trigger styles
    if (JSON.stringify(old.styles) !== JSON.stringify(this.#options.styles)) {
      trigger.style = true
    }

    this.#searchNode(element, this.#regex)
    if (trigger.version || trigger.popup || trigger.style) {
      this.#init(this.#options, trigger)
    }
    this.#manageEvents(this.#options)
  }

  /**
   *
   * @param {Object} options BibleUp Options
   * @param {*} trigger Optional - define what to trigger init on
   */
  #init (options, trigger = {}) {
    const definetrigger = { version: true, popup: true, style: true }
    trigger = { ...definetrigger, ...trigger }

    if (trigger.version) {
      const versions = ['KJV', 'ASV', 'LSV', 'WEB']
      if (versions.includes(options.version.toUpperCase()) === false) {
        this.#error('The version in BibleUp options is currently not supported. Try with other supported versions')
      }
    }

    if (trigger.popup) {
      const popup = ['classic', 'inline', 'wiki']
      if (popup.includes(options.popup)) {
        ConstructPopup.build(options, this.#buid)
        this.#popup = {
          container: document.getElementById(`bu-popup-${this.#buid}`),
          header: document.querySelector(`#bu-popup-${this.#buid} .bu-popup-header`),
          ref: document.querySelector(`#bu-popup-${this.#buid} .bu-popup-ref`),
          version: document.querySelector(`#bu-popup-${this.#buid} .bu-popup-version`),
          content: document.querySelector(`#bu-popup-${this.#buid} .bu-popup-content`),
          text: document.querySelector(`#bu-popup-${this.#buid} .bu-popup-text`),
          close: document.querySelector(`#bu-popup-${this.#buid} .bu-popup-close`) || false
        }
      } else {
        this.#error("BibleUp was unable to construct popup. Check to see if 'popup' option is correct")
      }
    }

    if (trigger.style) {
      if (this.#options.styles) {
        this.#setStyles(this.#options.styles)
      }
    }
  }

  #setStyles (styles) {
    const real = {
      primary: 'white',
      secondary: '#e6e6e6',
      tertiary: '#f2f2f2',
      headerColor: '#212529',
      color: ['#212529', '#212529', '#212529'],
      borderRadius: '0',
      boxShadow: '0px 0px 3px 0.7px #a6a6a6'
    }

    if (this.#options.popup === 'classic') {
      if (this.#options.darkTheme === true) {
        real.primary = '#595959'
        real.secondary = '#d9d9d9'
        real.color[0] = '#f2f2f2'
        real.headerColor = '#333'
      }
    }

    if (this.#options.popup === 'inline') {
      real.borderRadius = '5px'
      real.boxShadow = '0px 0px 2px 0.5px #ccc'
      if (this.#options.darkTheme === true) {
        real.primary = '#3d4245'
        real.color[0] = '#f2f2f2'
      }
    }

    if (this.#options.popup === 'wiki') {
      real.primary = 'white'
      real.secondary = 'white'
      if (this.#options.darkTheme === true) {
        real.primary = '#3d4245'
        real.color[0] = '#f2f2f2'
        real.color[1] = '#333'
      }
    }

    styles = { ...real, ...styles }

    this.#popup.container.style.background = styles.primary
    if (this.#popup.header) {
      this.#popup.header.style.background = styles.secondary
    }
    if (this.#popup.header) {
      this.#popup.header.style.color = styles.headerColor
    }
    // font color
    this.#popup.container.style.color = styles.color[0]
    // version background and color
    if (this.#popup.version) {
      this.#popup.version.style.background = styles.tertiary
      this.#popup.version.style.color = styles.color[1]
    }
    // close color
    if (this.#popup.close) {
      this.#popup.close.style.color = styles.color[2]
    }
    this.#popup.container.style.borderRadius = styles.borderRadius
    this.#popup.container.style.boxShadow = styles.boxShadow
    this.#popup.container.style.fontSize = styles.fontSize
  }

  /**
   * method: BibleUp Scripture Regex
   * param(refGroup) get all abbreviations and append each with '|' to construct a regex capturing group.
   * This regex is a combination of two regular expressions (standard Bible reference and look-behind Bible reference) using the or '|' operator
   * Contains a total of six capturing groups. 3 for the first regex and the remaining 3 for the look-behind
   * one set of the capturing group returns 'undefined' when the other regex is matched
   * Regex matches: john 3:16-17, 1 Tim 5:2,5&10
   */
  #generateRegex (bibleData) {
    let refGroup = ''
    const versions = 'KJV|ASV|LSV|WEB'
    const numberBooksRef = []

    for (const book of bibleData) {
      if (book.id === 66) {
        refGroup += book.book + '|' + book.abbr.join('|')
      } else {
        refGroup += book.book + '|' + book.abbr.join('|') + '|'
      }

      if (book.multipart) {
        numberBooksRef.push(book.book, ...book.abbr)
      }
    }

    const regex = [
      `(?:(?:(${refGroup})(?:\\.?)\\s?(\\d{1,3}))(?:(?=\\:)\\:\\s?(\\d{1,3}(?:\\s?\\-\\s?\\d{1,3})?)|)(?:[a-zA-Z])?(?:\\s(${versions}))?)`, // main regex
      `(?<=(?:(${refGroup})(?:\\.?)\\s?(\\d{1,3}))(?:\\:\\s?\\d{1,3}(?:\\s?\\-\\s?\\d{1,3})?)(?:[a-zA-Z])?(?:\\s(?:${versions}))?\\s?(?:\\,|\\;|\\&)\\s?(?:(?:\\s?\\d{1,3}|\\s?\\d{1,3}\\s?\\-\\s?\\d{1,3}|\\s?\\d{1,3}\\:\\d{1,3}(?:\\-\\d{1,3})?)(?:[a-zA-Z])?(?:\\,|\\;|\\&))*)(?!\\s?(?:${numberBooksRef.join('|')})(?:\\.?)\\b)\\s?(\\d{1,3}\\s?\\-\\s?\\d{1,3}|\\d{1,3}\\:\\d{1,3}(?:\\-\\d{1,3})?|\\d{1,3})(?:[a-zA-Z](?![a-zA-Z]))?` // match all seperated verse and ranges if it comes after main regex (eg- 5,2-7,12:5)
    ]

    const bibleRegex = new RegExp(regex.join('|'), 'g')
    return bibleRegex
  }

  /**
   * This function traverse all nodes and child nodes in the `e` parameter and calls #createLink on all text nodes that matches the Bible regex
   * The function performs a self call on element child nodes until all matches are found
   */
  #searchNode (e, regex) {
    let type = e?.nodeType ?? this.#error('Element does not exist in the DOM')
    const match = e.textContent.match(regex) || false
    let next

    if (type === 3 && match) {
      this.#createLink(e, regex)
    } else if (type === 1 && match) {
      // element node
      if ((e = e.firstChild)) {
        do {
          next = e.nextSibling
          type = e.nodeType
          if (type === 1) {
            if (this.#validateNode(e)) {
              this.#searchNode(e, regex)
            }
          } else {
            this.#searchNode(e, regex)
          }
        } while ((e = next))
      }
    }
  }

  /**
   * {desc} This function validates elements node before running #searchNode() on subsequent child elements
   * Returns true after successful validation else returns false
   */
  #validateNode (e) {
    const forbiddenTags = this.#options.bu_ignore
    const allowedTags = this.#options.bu_allow
    const privateIgnore = [...forbiddenTags, 'SCRIPT', 'STYLE', 'SVG', 'INPUT', 'TEXTAREA', 'SELECT']
    if (privateIgnore.includes(e.tagName) && !allowedTags.includes(e.tagName)) {
      return false
    } else if (e.classList.contains('bu-ignore') === false) {
      return true
    }
  }

  /**
   * {desc} This function returns: appends <cite> on text nodes with a scripture match
   * It replaces 'This text is john 3.16' with 'This text is <cite attr>John 3:16</cite>'
   * param(node) is a text node
   */
  #createLink (node) {
    const newNode = document.createElement('div')
    newNode.innerHTML = node.nodeValue.replace(this.#regex, this.#setLinkMarkup.bind(this))

    if (node.nodeValue !== newNode.innerHTML) {
      while (newNode.firstChild) {
        // console.log(newNode.firstChild.textContent);
        node.parentNode.insertBefore(newNode.firstChild, node)
      }
      node.parentNode.removeChild(node)
    }
  }

  /**
   * param(match) is the actual matched string. Check replace() on MDN
   * param(p1) is value of first capturing group. Pn is the capturing group for 'n'. Check replace() on MDN
   * The first three capturing groups (p1 - p3) matches a standard Bible reference (Romans 3:23-25)
   * p4 matches verse-level references for only single references
   * The remaining three capturing groups matches the look-behind Bible reference (John 3:16,27,3-5 = matches 27 and 3-5)
   * returns <cite[data-*]>john 3:16</cite>
   */
  #setLinkMarkup (match, p1, p2, p3, p4, p5, p6, p7) {
    const bible = {
      book: undefined,
      chapter: undefined,
      verse: undefined,
      version: undefined
    }

    const vesreContext = (verse) => {
      const result = {}
      if ((verse.includes(':') && verse.includes('-')) || verse.includes(':')) {
        // (in-line chapter with range) or (in-line chapter only)
        result.chapter = verse.slice(0, verse.lastIndexOf(':'))
        result.verse = verse.slice(verse.lastIndexOf(':') + 1)
        this.#inlineChapter = result.chapter
      } else if (this.#inlineChapter) {
        result.chapter = this.#inlineChapter
      }

      return result
    }

    if (p1 !== undefined) {
      // standard Bible regex
      bible.book = p1
      bible.chapter = p2
      bible.verse = p3 || '1'
      if (p4 !== undefined) {
        bible.version = p4
      }
      this.#inlineChapter = undefined
    } else {
      // look-behind Bible regex
      const { chapter, verse } = vesreContext(p7)
      bible.book = p5
      bible.chapter = chapter || p6
      bible.verse = verse || p7
    }

    const buData = this.#validateBible(bible)
    if (buData === false) {
      return match
    }

    const result = `
		<cite>
		<a href='#' class='bu-link bu-link-${this.#buid}' bu-data='${buData}'>${match}</a>
		</cite>`
    return result
  }

  /*
   * @param match - match is an object with reference breakdown
   * Returns stringified object containing valid, complete reference (bu-data) if reference is valid else returns false
   * The object is in the form - {ref,book,chapter,verse,apiBook}
   */
  #validateBible (bible) {
    let bibleRef = `${bible.book} ${bible.chapter}:${bible.verse.replaceAll(' ', '')}`
    bibleRef = Bible.extractPassage(bibleRef)

    if (bible.version) {
      // add version tagging if present
      bibleRef.version = bible.version
    }

    for (const data of bibleData) {
      if (data.book === bibleRef.book) {
        if (
          bibleRef.chapter <= data.chapters.length &&
          data.chapters[bibleRef.chapter - 1] !== undefined &&
          bibleRef.verse <= data.chapters[bibleRef.chapter - 1]
        ) {
          if (bibleRef.verseEnd === undefined) {
            return JSON.stringify(bibleRef)
          } else if (bibleRef.verseEnd <= data.chapters[bibleRef.chapter - 1]) {
            return JSON.stringify(bibleRef)
          } else {
            return false
          }
        } else {
          return false
        }
      }
    }
  }

  #manageEvents () {
    const bulink = document.querySelectorAll(`.bu-link-${this.#buid}`)
    // link 'anchor' events
    bulink.forEach((link) => {
      link.removeEventListener('mouseenter', this.#events.clickHandler)
      link.removeEventListener('mouseleave', this.#events.closePopup)

      // prevent scroll behaviour
      link.onclick = (e) => {
        e.preventDefault()
        e.stopPropagation()
      }

      link.addEventListener('mouseenter', this.#events.clickHandler)
      link.addEventListener('mouseleave', this.#events.closePopup)
    })

    this.#popup.container.onmouseenter = () => {
      this.#mouseOnPopup = true
    }

    this.#popup.container.onmouseleave = (e) => {
      this.#mouseOnPopup = false
      this.#closePopup(e)
    }

    // close popup events
    if (this.#popup.close) {
      this.#popup.close.removeEventListener('click', this.#events.exitPopup)
      this.#popup.close.addEventListener('click', this.#events.exitPopup)
    }

    window.onkeydown = (e) => {
      if (e.key === 'Escape') {
        if (this.#ispopupOpen) {
          this.#exitPopup()
        }
      }
    }
  }

  /**
   * {type} Event Handler for mouseEnter and click events
   * calls series of methods and updates popup
   */

  async #clickHandler (e) {
    this.#clearTimer()

    const getPosition = (el) => {
      const top = el.getBoundingClientRect().top
      const left = el.getBoundingClientRect().left
      return top + left
    }

    // only update popup if popup is already hidden or different link is clicked than the one active
    if (this.#ispopupOpen === false || this.#activeLink !== getPosition(e.currentTarget)) {
      this.#activeLink = getPosition(e.currentTarget)
      let bibleRef = e.currentTarget.getAttribute('bu-data')
      bibleRef = JSON.parse(bibleRef)

      // add delay before popup 'loading' - to allow fetch return cache if it exists
      this.#loadingTimer = setTimeout(() => {
        this.#updatePopup(bibleRef, true)
        positionPopup(e, this.#options.popup, this.#popup.container)
        this.#openPopup()
      }, 100)

      // call to fetch bible text
      this.#currentRef = bibleRef.ref
      const res = await Search.getScripture(bibleRef, bibleRef.version ?? this.#options.version)

      if (this.#currentRef === res.ref) {
        // only when cursor is on same link
        this.#updatePopup(res, false)
        positionPopup(e, this.#options.popup, this.#popup.container)
        if (this.#loadingTimer) {
          this.#openPopup()
          clearTimeout(this.#loadingTimer)
        }
      }
    }
  }

  /**
   * @param res contains bu-data content of a link, and the full text (if isLoading is false)
   * @param isLoading a boolean that makes popup show 'loading' before the bible text is updated
   * @param res res.ref, res.text, res.chapter, res.verse, res.version - a complete res object
   * (description) update popup data
   */
  #updatePopup (res, isLoading) {
    if (isLoading) {
      if (this.#popup.ref) {
        this.#popup.ref.textContent = res.ref
      }

      if (this.#popup.version) {
        this.#popup.version.textContent = res.version ?? this.#options.version.toUpperCase()
      }

      this.#popup.text.textContent = 'Loading...'
    } else {
      if (this.#popup.ref) {
        this.#popup.ref.textContent = res.ref
        // REF Accessibility
        this.#popup.container.setAttribute('aria-label', `${res.ref}`)
      }

      if (this.#popup.version) {
        this.#popup.version.textContent = res.version
      }

      this.#popup.text.setAttribute('start', res.refData.startVerse)

      if (res.text == null) {
        this.#popup.text.textContent = 'Cannot load bible reference at the moment.'
      } else {
        this.#popup.text.innerHTML = ''
        res.text.forEach((verse) => {
          this.#popup.text.innerHTML += `<li>${verse}</li>`
        })
      }
    }
  }

  #openPopup () {
    if (!this.#ispopupOpen) {
      this.#popup.container.classList.remove('bu-popup-hide')
      if (this.#popup.close) {
        this.#popup.close.focus()
      }
      this.#ispopupOpen = true
    }
  }

  /**
   * closePopup() is for mouse events which needs timeout
   */
  #closePopup (e) {
    if (!this.#popupTimer) {
      this.#popupTimer = setTimeout(() => {
        if (!this.#mouseOnPopup) {
          const mouseFrom = e.relatedTarget
          if (!mouseFrom || mouseFrom.classList.contains(`bu-link-${this.#buid}`) === false) {
            this.#exitPopup()
          }
        }
        this.#clearTimer()
      }, 100)
    }
  }

  #exitPopup () {
    this.#popup.container.classList.add('bu-popup-hide')
    this.#mouseOnPopup = false
    this.#ispopupOpen = false
  }

  #clearTimer () {
    clearTimeout(this.#loadingTimer)
    clearTimeout(this.#popupTimer)
    this.#loadingTimer = undefined
    this.#popupTimer = undefined
  }

  #error (msg) {
    throw new Error(msg)
  }
}
